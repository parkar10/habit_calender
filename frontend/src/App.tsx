import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Calendar from './components/Calendar';
import HabitModal from './components/HabitModal';
import Trends from './components/Trends';
import Habits from './components/Habits';
import { Habit } from './types';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'trends' | 'habits'>('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [existingHabits, setExistingHabits] = useState<Habit[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setCurrentUser('admin');
    }
  }, []);

  const handleLogin = (token: string, username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentUser('');
    setModalOpen(false);
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date, habits: Habit[]) => {
    setSelectedDate(date);
    setExistingHabits(habits);
    setModalOpen(true);
  };

  const handleHabitAdded = () => {
    // Trigger calendar refresh
    setRefreshTrigger(prev => prev + 1);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>Habit Tracker</h1>
          <span className="user-info">Welcome, {currentUser}!</span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button
            className={`nav-tab ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            Habits
          </button>
          <button
            className={`nav-tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'calendar' && (
          <Calendar onDateClick={handleDateClick} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'habits' && <Habits />}
        {activeTab === 'trends' && <Trends />}
      </main>

      <HabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedDate={selectedDate}
        existingHabits={existingHabits}
        onHabitAdded={handleHabitAdded}
      />
    </div>
  );
}

export default App;
