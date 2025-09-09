import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key';

const PREDEFINED_USERNAME = 'admin';
const PREDEFINED_PASSWORD = '$2b$10$suEh6fSrZll3quhwHARjleoufqUjUALrI9cgN82vwI4sBark.vDUa'; // password: 'admin123'

app.use(cors());
app.use(express.json());

// In-memory storage for testing (replace with Cassandra when ready)
interface Habit {
  habit_id: string;
  user_id: string;
  date: string;
  habit_name: string;
  description?: string;
  completed: boolean;
  created_at: Date;
}

const habits: Habit[] = [];

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
    const userHabits = habits.filter(h => h.user_id === req.user?.username && h.date === date);
    res.json(userHabits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/habits', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, habit_name, description, completed } = req.body;
    const habit_id = require('crypto').randomUUID();
    
    const newHabit: Habit = {
      habit_id,
      user_id: req.user?.username || 'admin',
      date,
      habit_name,
      description: description || '',
      completed: completed !== undefined ? completed : true,
      created_at: new Date()
    };
    
    habits.push(newHabit);
    res.json({ success: true, habit_id });
  } catch (error) {
    console.error('Error adding habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/trends', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userHabits = habits.filter(h => h.user_id === req.user?.username && h.completed);
    
    // Group by date and count habits
    const trendMap = new Map<string, number>();
    userHabits.forEach(habit => {
      const count = trendMap.get(habit.date) || 0;
      trendMap.set(habit.date, count + 1);
    });
    
    // Convert to array and sort by date (most recent first)
    const trends = Array.from(trendMap.entries())
      .map(([date, habit_count]) => ({ date, habit_count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 entries
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/habits/:habitId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const habitId = req.params.habitId;
    const index = habits.findIndex(h => h.habit_id === habitId && h.user_id === req.user?.username);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    habits.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory storage (no Cassandra required)');
  console.log('Login with username: admin, password: admin123');
});