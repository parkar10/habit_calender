import React, { useState, useEffect } from 'react';
import { habits } from '../api';
import { Habit } from '../types';
import './Habits.css';

interface HabitSummary {
  habit_name: string;
  count: number;
  last_used: string;
  description?: string;
}

const Habits: React.FC = () => {
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [habitSummaries, setHabitSummaries] = useState<HabitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count' | 'recent'>('count');

  useEffect(() => {
    loadAllHabits();
  }, []);

  const loadAllHabits = async () => {
    try {
      // Get habits from last 365 days
      const promises = [];
      const today = new Date();
      
      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        promises.push(habits.getByDate(dateStr).catch(() => []));
      }
      
      const results = await Promise.all(promises);
      const allHabitsFlat = results.flat();
      
      setAllHabits(allHabitsFlat);
      generateSummaries(allHabitsFlat);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
    setLoading(false);
  };

  const generateSummaries = (habitsData: Habit[]) => {
    const habitMap = new Map<string, HabitSummary>();

    habitsData.forEach(habit => {
      const key = habit.habit_name.toLowerCase().trim();
      if (habitMap.has(key)) {
        const existing = habitMap.get(key)!;
        existing.count += 1;
        // Update to most recent date
        if (habit.date > existing.last_used) {
          existing.last_used = habit.date;
          if (habit.description) {
            existing.description = habit.description;
          }
        }
      } else {
        habitMap.set(key, {
          habit_name: habit.habit_name,
          count: 1,
          last_used: habit.date,
          description: habit.description
        });
      }
    });

    const summaries = Array.from(habitMap.values());
    setHabitSummaries(summaries);
  };

  const filteredAndSortedHabits = () => {
    let filtered = habitSummaries;

    if (searchTerm) {
      filtered = habitSummaries.filter(habit =>
        habit.habit_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.habit_name.localeCompare(b.habit_name));
      case 'count':
        return filtered.sort((a, b) => b.count - a.count);
      case 'recent':
        return filtered.sort((a, b) => b.last_used.localeCompare(a.last_used));
      default:
        return filtered;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getHabitColor = (index: number) => {
    const colors = [
      { bg: '#1a365d', color: '#63b3ed', border: '#63b3ed' },
      { bg: '#1a2f1a', color: '#68d391', border: '#68d391' },
      { bg: '#2d1b0f', color: '#f6ad55', border: '#f6ad55' },
      { bg: '#2d1b2d', color: '#d53f8c', border: '#d53f8c' },
      { bg: '#1a2332', color: '#90cdf4', border: '#90cdf4' }
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="habits-container">
        <div className="loading">Loading your habits...</div>
      </div>
    );
  }

  return (
    <div className="habits-container">
      <div className="habits-header">
        <h2>Your Habit Library</h2>
        <p>All your tracked habits and their frequency</p>
      </div>

      <div className="habits-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'count' | 'recent')}
            className="sort-select"
          >
            <option value="count">Most Frequent</option>
            <option value="recent">Recently Used</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      <div className="habits-stats">
        <div className="stat-card">
          <div className="stat-number">{habitSummaries.length}</div>
          <div className="stat-label">Unique Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{allHabits.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(allHabits.length / habitSummaries.length * 10) / 10}</div>
          <div className="stat-label">Avg per Habit</div>
        </div>
      </div>

      {filteredAndSortedHabits().length === 0 ? (
        <div className="no-habits">
          <h3>No habits found</h3>
          <p>Start tracking habits from the calendar to see them here!</p>
        </div>
      ) : (
        <div className="habits-grid">
          {filteredAndSortedHabits().map((habit, index) => {
            const colors = getHabitColor(index);
            return (
              <div 
                key={habit.habit_name} 
                className="habit-card"
                style={{
                  background: colors.bg,
                  borderLeft: `4px solid ${colors.border}`
                }}
              >
                <div className="habit-card-header">
                  <h3 className="habit-name" style={{ color: colors.color }}>
                    {habit.habit_name}
                  </h3>
                  <div className="habit-count" style={{ color: colors.color }}>
                    {habit.count}x
                  </div>
                </div>
                
                {habit.description && (
                  <p className="habit-description">
                    {habit.description}
                  </p>
                )}
                
                <div className="habit-meta">
                  <span className="last-used">
                    Last used: {formatDate(habit.last_used)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Habits;