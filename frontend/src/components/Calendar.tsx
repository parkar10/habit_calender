import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { habits } from '../api';
import { Habit } from '../types';
import './Calendar.css';
import 'react-calendar/dist/Calendar.css';

interface CalendarComponentProps {
  onDateClick: (date: Date, existingHabits: Habit[]) => void;
  refreshTrigger?: number;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onDateClick, refreshTrigger }) => {
  const [date, setDate] = useState(new Date());
  const [habitDates, setHabitDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllHabits();
  }, [refreshTrigger]);

  const refreshHabits = () => {
    loadAllHabits();
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = async (value: Date) => {
    setDate(value);
    const dateStr = formatDate(value);
    const existingHabits = dateHabits.get(dateStr) || [];
    onDateClick(value, existingHabits);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      if (habitDates.has(dateStr)) {
        return 'has-habits';
      }
    }
    return '';
  };

  const [dateHabits, setDateHabits] = useState<Map<string, Habit[]>>(new Map());

  const loadAllHabits = async () => {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      const habitMap = new Map<string, Habit[]>();
      const habitSet = new Set<string>();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(new Date(currentYear, currentMonth, day));
        try {
          const dayHabits = await habits.getByDate(dateStr);
          if (dayHabits.length > 0) {
            habitMap.set(dateStr, dayHabits);
            habitSet.add(dateStr);
          }
        } catch (err) {
          // Ignore errors for individual dates
        }
      }
      
      setDateHabits(habitMap);
      setHabitDates(habitSet);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      const dayHabits = dateHabits.get(dateStr) || [];
      
      if (dayHabits.length > 0) {
        return (
          <div className="habits-preview">
            {dayHabits.slice(0, 3).map((habit, index) => (
              <div key={habit.habit_id} className="habit-chip" title={habit.habit_name}>
                {habit.habit_name}
              </div>
            ))}
            {dayHabits.length > 3 && (
              <div className="habit-more">+{dayHabits.length - 3} more</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Habit Calendar</h2>
        <p>Click on any date to add or view habits</p>
      </div>
      <Calendar
        value={date}
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="habit-calendar"
      />
    </div>
  );
};

export default CalendarComponent;