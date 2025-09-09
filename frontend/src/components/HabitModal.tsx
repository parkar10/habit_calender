import React, { useState, useEffect } from 'react';
import { habits } from '../api';
import { Habit } from '../types';
import './HabitModal.css';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  existingHabits: Habit[];
  onHabitAdded: () => void;
}

const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  existingHabits,
  onHabitAdded
}) => {
  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [suggestions, setSuggestions] = useState<{ habit_name: string; description: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalHabits(existingHabits);
      loadSuggestions();
    }
  }, [isOpen, existingHabits]);

  const loadSuggestions = async () => {
    try {
      const habitSuggestions = await habits.getSuggestions();
      setSuggestions(habitSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      habitName && 
      suggestion.habit_name.toLowerCase().includes(habitName.toLowerCase()) &&
      suggestion.habit_name.toLowerCase() !== habitName.toLowerCase()
  ).slice(0, 5);

  const handleSuggestionClick = (suggestion: { habit_name: string; description: string }) => {
    setHabitName(suggestion.habit_name);
    setDescription(suggestion.description);
    setShowSuggestions(false);
  };

  const handleHabitNameChange = (value: string) => {
    setHabitName(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !habitName.trim()) return;

    setLoading(true);
    setShowSuggestions(false);
    try {
      const result = await habits.create({
        date: formatDate(selectedDate),
        habit_name: habitName.trim(),
        description: description.trim(),
        completed: true
      });

      const newHabit: Habit = {
        habit_id: result.habit_id,
        user_id: 'admin',
        date: formatDate(selectedDate),
        habit_name: habitName.trim(),
        description: description.trim(),
        completed: true,
        created_at: new Date()
      };

      setLocalHabits([...localHabits, newHabit]);
      setHabitName('');
      setDescription('');
      onHabitAdded();
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async (habitId: string) => {
    try {
      await habits.delete(habitId);
      setLocalHabits(localHabits.filter(h => h.habit_id !== habitId));
      onHabitAdded();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !selectedDate) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Habits for {formatDisplayDate(selectedDate)}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {localHabits.length > 0 && (
            <div className="existing-habits">
              <h3>Completed Habits</h3>
              <div className="habits-list">
                {localHabits.map((habit) => (
                  <div key={habit.habit_id} className="habit-item">
                    <div className="habit-info">
                      <div className="habit-name">{habit.habit_name}</div>
                      {habit.description && (
                        <div className="habit-description">{habit.description}</div>
                      )}
                    </div>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(habit.habit_id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="add-habit-form">
            <h3>Add New Habit</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="habitName">Habit Name</label>
                <div className="input-container">
                  <input
                    id="habitName"
                    type="text"
                    value={habitName}
                    onChange={(e) => handleHabitNameChange(e.target.value)}
                    onFocus={() => setShowSuggestions(habitName.length > 0 && filteredSuggestions.length > 0)}
                    placeholder="e.g., Went for a run, Read 30 minutes, Meditated"
                    required
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="suggestion-name">{suggestion.habit_name}</div>
                          {suggestion.description && (
                            <div className="suggestion-description">{suggestion.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any notes about this habit..."
                  rows={3}
                />
              </div>
              
              <button type="submit" disabled={loading || !habitName.trim()}>
                {loading ? 'Adding...' : 'Add Habit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitModal;