export interface Habit {
  habit_id: string;
  user_id: string;
  date: string;
  habit_name: string;
  description?: string;
  completed: boolean;
  created_at: Date;
}

export interface AuthData {
  token: string;
  username: string;
}

export interface TrendData {
  date: string;
  habit_count: number;
}