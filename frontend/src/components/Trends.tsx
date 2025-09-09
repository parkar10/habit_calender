import React, { useState, useEffect } from 'react';
import { trends } from '../api';
import { TrendData } from '../types';
import './Trends.css';

const Trends: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const data = await trends.get();
      setTrendData(data);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStreakCount = (): number => {
    if (trendData.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedData = [...trendData].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const trend of sortedData) {
      if (trend.habit_count > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getTotalHabits = (): number => {
    return trendData.reduce((total, trend) => total + trend.habit_count, 0);
  };

  const getMaxHabitsInDay = (): number => {
    return trendData.reduce((max, trend) => Math.max(max, trend.habit_count), 0);
  };

  if (loading) {
    return (
      <div className="trends-container">
        <div className="loading">Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="trends-container">
      <div className="trends-header">
        <h2>Your Progress</h2>
        <p>Track your habit journey over time</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{getStreakCount()}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getTotalHabits()}</div>
          <div className="stat-label">Total Habits</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getMaxHabitsInDay()}</div>
          <div className="stat-label">Best Day</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{trendData.filter(t => t.habit_count > 0).length}</div>
          <div className="stat-label">Active Days</div>
        </div>
      </div>

      {trendData.length > 0 ? (
        <div className="chart-container">
          <h3>Daily Activity (Last 30 Days)</h3>
          <div className="chart">
            {trendData.map((trend, index) => (
              <div key={trend.date} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${Math.max((trend.habit_count / getMaxHabitsInDay()) * 100, 5)}%`
                  }}
                  title={`${formatDate(trend.date)}: ${trend.habit_count} habits`}
                >
                  <span className="bar-value">{trend.habit_count}</span>
                </div>
                <div className="chart-label">{formatDate(trend.date)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-data">
          <h3>No habit data yet</h3>
          <p>Start tracking your habits to see your progress here!</p>
        </div>
      )}
    </div>
  );
};

export default Trends;