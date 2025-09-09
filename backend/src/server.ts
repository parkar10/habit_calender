import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Client } from 'cassandra-driver';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key';

const PREDEFINED_USERNAME = 'admin';
const PREDEFINED_PASSWORD = '$2b$10$suEh6fSrZll3quhwHARjleoufqUjUALrI9cgN82vwI4sBark.vDUa'; // password: 'admin123'

app.use(cors());
app.use(express.json());

const client = new Client({
  contactPoints: [process.env.CASSANDRA_HOST || '127.0.0.1'],
  localDataCenter: 'datacenter1'
  // Don't specify keyspace initially - we'll create it first
});

interface AuthRequest extends express.Request {
  user?: { username: string };
}

const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== PREDEFINED_USERNAME) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, PREDEFINED_PASSWORD);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ token, username });
});

app.get('/api/habits/:date', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const date = req.params.date;
    const query = 'SELECT * FROM habits WHERE user_id = ? AND date = ?';
    const result = await client.execute(query, [req.user?.username, date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/habits', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, habit_name, description, completed } = req.body;
    const habit_id = require('crypto').randomUUID();
    
    const query = `
      INSERT INTO habits (habit_id, user_id, date, habit_name, description, completed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await client.execute(query, [
      habit_id,
      req.user?.username,
      date,
      habit_name,
      description || '',
      completed || true,
      new Date()
    ]);
    
    res.json({ success: true, habit_id });
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/trends', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Get all habits for the user and aggregate client-side
    const query = `SELECT user_id, date, completed FROM habits WHERE user_id = ?`;
    const result = await client.execute(query, [req.user?.username]);
    
    // Group by date and count completed habits
    const trendMap = new Map<string, number>();
    result.rows.forEach((row: any) => {
      if (row.completed) {
        const count = trendMap.get(row.date) || 0;
        trendMap.set(row.date, count + 1);
      }
    });
    
    // Convert to array and sort by date (most recent first)
    const trends = Array.from(trendMap.entries())
      .map(([date, habit_count]) => ({ date, habit_count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/habits/suggestions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Get all habits for the user and create unique suggestions
    const query = `SELECT habit_name, description FROM habits WHERE user_id = ?`;
    const result = await client.execute(query, [req.user?.username]);
    
    // Create unique suggestions map
    const suggestionsMap = new Map<string, { habit_name: string; description: string }>();
    
    result.rows.forEach((row: any) => {
      const key = row.habit_name.toLowerCase().trim();
      if (!suggestionsMap.has(key)) {
        suggestionsMap.set(key, {
          habit_name: row.habit_name,
          description: row.description || ''
        });
      }
    });
    
    const suggestions = Array.from(suggestionsMap.values())
      .sort((a, b) => a.habit_name.localeCompare(b.habit_name));
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching habit suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/habits/:habitId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const habitId = req.params.habitId;
    // First, get the habit to find the date (needed for the primary key)
    const findQuery = 'SELECT date FROM habits WHERE user_id = ? AND habit_id = ? ALLOW FILTERING';
    const findResult = await client.execute(findQuery, [req.user?.username, habitId]);
    
    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    const date = findResult.rows[0].date;
    const deleteQuery = 'DELETE FROM habits WHERE user_id = ? AND date = ? AND habit_id = ?';
    await client.execute(deleteQuery, [req.user?.username, date, habitId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const initDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to Cassandra');

    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS habit_tracker
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);

    await client.execute('USE habit_tracker');

    // Drop and recreate table with correct schema
    try {
      await client.execute('DROP TABLE IF EXISTS habits');
    } catch (err) {
      // Ignore if table doesn't exist
    }

    await client.execute(`
      CREATE TABLE habits (
        user_id TEXT,
        date TEXT,
        habit_id UUID,
        habit_name TEXT,
        description TEXT,
        completed BOOLEAN,
        created_at TIMESTAMP,
        PRIMARY KEY (user_id, date, habit_id)
      )
    `);

    // No additional indexes needed with the new primary key structure

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running on port ${PORT}`);
});