-- Create keyspace for habit tracker
CREATE KEYSPACE IF NOT EXISTS habit_tracker
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

-- Use the keyspace
USE habit_tracker;

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  habit_id UUID PRIMARY KEY,
  user_id TEXT,
  date TEXT,
  habit_name TEXT,
  description TEXT,
  completed BOOLEAN,
  created_at TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS ON habits (user_id);
CREATE INDEX IF NOT EXISTS ON habits (date);
CREATE INDEX IF NOT EXISTS ON habits (user_id, date);