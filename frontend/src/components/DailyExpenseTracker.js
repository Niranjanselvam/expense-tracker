import React, { useState, useEffect } from 'react';
import { dailyExpenseAPI } from '../services/api';
import '../styles/DailyExpenseTracker.css';

function DailyExpenseTracker({ onTrackerUpdate }) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeExpense, setActiveExpense] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Daily');
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isNight, setIsNight] = useState(false);

  const categories = ['Daily', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

  useEffect(() => {
    checkActiveTracker();
    fetchTodayExpenses();
    const interval = setInterval(() => {
      updateElapsedTime();
      checkNightTime();
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkActiveTracker = async () => {
    try {
      const response = await dailyExpenseAPI.getActive();
      if (response.data) {
        setActiveExpense(response.data);
        setIsTracking(true);
      }
    } catch (err) {
      console.error('Error checking active tracker:', err);
    }
  };

  const fetchTodayExpenses = async () => {
    try {
      const response = await dailyExpenseAPI.getToday();
      setTodayExpenses(response.data);
    } catch (err) {
      console.error('Error fetching today expenses:', err);
    }
  };

  const updateElapsedTime = () => {
    if (activeExpense && activeExpense.start_time) {
      const start = new Date(activeExpense.start_time);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }
  };

  const checkNightTime = () => {
    const hour = new Date().getHours();
    setIsNight(hour >= 22 || hour < 5); // 10 PM to 5 AM
  };

  const handleStartTracker = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dailyExpenseAPI.start(today, category);
      setActiveExpense(response.data);
      setIsTracking(true);
      setAmount('');
      setDescription('');
      fetchTodayExpenses();
    } catch (err) {
      alert('Error starting tracker: ' + err.message);
    }
  };

  const handleStopTracker = async () => {
    if (!activeExpense) return;

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await dailyExpenseAPI.stop(activeExpense.id, parseFloat(amount), description);
      setIsTracking(false);
      setActiveExpense(null);
      setAmount('');
      setDescription('');
      setElapsedTime('00:00:00');
      fetchTodayExpenses();
    } catch (err) {
      alert('Error stopping tracker: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await dailyExpenseAPI.delete(id);
        fetchTodayExpenses();
      } catch (err) {
        alert('Error deleting expense: ' + err.message);
      }
    }
  };

  const getTotalDailyExpense = () => {
    return todayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(2);
  };

  return (
    <div className="daily-expense-tracker">
      <h2>⏱️ Daily Expense Tracker</h2>

      {/* Active Tracker Section */}
      <div className={`tracker-section ${isTracking ? 'active' : ''}`}>
        <h3>Tracking Status</h3>
        {isTracking ? (
          <div className="tracking-active">
            <div className="elapsed-time">{elapsedTime}</div>
            <p className="tracking-info">Tracker is running...</p>

            <div className="tracker-form">
              <div className="form-group">
                <label>Category:</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you spend on?"
                />
              </div>

              <div className="form-actions">
                <button
                  className={`stop-btn ${isNight ? 'enabled' : 'disabled'}`}
                  onClick={handleStopTracker}
                  disabled={!isNight}
                  title={!isNight ? 'Stop button enabled at night (10 PM - 5 AM)' : 'Click to stop tracking'}
                >
                  {isNight ? '🛑 Stop Tracker (Night Mode)' : '🔒 Stop Button (Night Only)'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="tracking-inactive">
            <p className="status">Tracker is not running</p>
            <button className="start-btn" onClick={handleStartTracker}>
              ▶️ Start Daily Tracker
            </button>
          </div>
        )}
      </div>

      {/* Today's Expenses Summary */}
      <div className="expenses-summary">
        <h3>Today's Expenses</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="label">Total:</span>
            <span className="value">₹ {getTotalDailyExpense()}</span>
          </div>
          <div className="stat">
            <span className="label">Count:</span>
            <span className="value">{todayExpenses.length}</span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {todayExpenses.length > 0 && (
        <div className="expenses-list">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {todayExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.stop_time ? new Date(expense.stop_time).toLocaleTimeString() : 'Running'}</td>
                  <td>{expense.category}</td>
                  <td>₹ {expense.amount}</td>
                  <td>{expense.description || '-'}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteExpense(expense.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyExpenseTracker;
