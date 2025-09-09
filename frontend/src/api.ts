import axios from 'axios';
import { AuthData, Habit, TrendData } from './types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username: string, password: string): Promise<AuthData> => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
};

export const habits = {
  getByDate: async (date: string): Promise<Habit[]> => {
    const response = await api.get(`/habits/${date}`);
    return response.data;
  },

  create: async (habitData: {
    date: string;
    habit_name: string;
    description?: string;
    completed?: boolean;
  }): Promise<{ success: boolean; habit_id: string }> => {
    const response = await api.post('/habits', habitData);
    return response.data;
  },

  delete: async (habitId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/habits/${habitId}`);
    return response.data;
  },

  getSuggestions: async (): Promise<{ habit_name: string; description: string }[]> => {
    const response = await api.get('/habits/suggestions');
    return response.data;
  },
};

export const trends = {
  get: async (): Promise<TrendData[]> => {
    const response = await api.get('/trends');
    return response.data;
  },
};