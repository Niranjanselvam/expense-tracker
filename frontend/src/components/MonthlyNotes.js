import React, { useState, useEffect } from 'react';
import { monthlyNotesAPI, incomeAPI, transactionAPI } from '../services/api';
import '../styles/MonthlyNotes.css';

function MonthlyNotes() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const [notes, setNotes] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      // Fetch monthly note
      const noteResponse = await monthlyNotesAPI.get(currentMonth.year, currentMonth.month);
      if (noteResponse.data) {
        setNotes(noteResponse.data.notes || '');
      } else {
        setNotes('');
      }

      // Fetch total income
      const incomeResponse = await incomeAPI.getMonthlyTotal(
        currentMonth.year,
        currentMonth.month
      );
      setTotalIncome(incomeResponse.data.total || 0);

      // Fetch total expense
      const expenseResponse = await transactionAPI.getMonthlySummary(
        currentMonth.year,
        currentMonth.month
      );
      const total = expenseResponse.data.reduce((sum, item) => {
        return item.type === 'Expense' ? sum + item.total : sum;
      }, 0);
      setTotalExpense(total);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const data = {
        year: currentMonth.year,
        month: currentMonth.month,
        totalIncome,
        totalExpense,
        notes,
      };

      await monthlyNotesAPI.createOrUpdate(data);
      alert('Monthly notes saved successfully!');
    } catch (err) {
      alert('Error saving notes: ' + err.message);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const getMonthName = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return monthNames[currentMonth.month - 1];
  };

  const getBalance = () => {
    return (totalIncome - totalExpense).toFixed(2);
  };

  const savingsPercentage = totalIncome > 0 
    ? ((parseFloat(getBalance()) / totalIncome) * 100).toFixed(2) 
    : 0;

  return (
    <div className="monthly-notes">
      <h2>📊 Monthly Summary & Notes</h2>

      {/* Month Navigation */}
      <div className="month-navigation">
        <button onClick={handlePreviousMonth}>← Previous</button>
        <h3>
          {getMonthName()} {currentMonth.year}
        </h3>
        <button onClick={handleNextMonth}>Next →</button>
      </div>

      {loading ? (
        <p className="loading">Loading monthly data...</p>
      ) : (
        <>
          {/* Monthly Stats */}
          <div className="monthly-stats">
            <div className="stat-card income-card">
              <span className="label">Total Income</span>
              <span className="value">₹ {totalIncome.toFixed(2)}</span>
            </div>

            <div className="stat-card expense-card">
              <span className="label">Total Expense</span>
              <span className="value">₹ {totalExpense.toFixed(2)}</span>
            </div>

            <div className={`stat-card balance-card ${parseFloat(getBalance()) >= 0 ? 'positive' : 'negative'}`}>
              <span className="label">Balance</span>
              <span className="value">₹ {getBalance()}</span>
            </div>

            <div className="stat-card savings-card">
              <span className="label">Savings Rate</span>
              <span className="value">{savingsPercentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Expense vs Income</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill expense"
                style={{
                  width: totalIncome > 0 ? `${Math.min((totalExpense / totalIncome) * 100, 100)}%` : '0%',
                }}
              ></div>
            </div>
            <div className="progress-info">
              {totalIncome > 0 ? `${((totalExpense / totalIncome) * 100).toFixed(1)}%` : '0%'} of income spent
            </div>
          </div>

          {/* Notes Section */}
          <div className="notes-section">
            <h3>📝 Monthly Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this month (expenses, goals, observations, etc.)"
              rows="6"
            />
            <button className="save-btn" onClick={handleSaveNotes}>
              💾 Save Notes
            </button>
          </div>

          {/* Summary Display */}
          <div className="summary-display">
            <h3>Monthly Report</h3>
            <div className="report-content">
              <p>
                <strong>Month:</strong> {getMonthName()} {currentMonth.year}
              </p>
              <p>
                <strong>Total Income:</strong> ₹ {totalIncome.toFixed(2)}
              </p>
              <p>
                <strong>Total Expense:</strong> ₹ {totalExpense.toFixed(2)}
              </p>
              <p className={parseFloat(getBalance()) >= 0 ? 'positive' : 'negative'}>
                <strong>Balance:</strong> ₹ {getBalance()}
              </p>
              {notes && (
                <p>
                  <strong>Notes:</strong> {notes}
                </p>
              )}
              <p>
                <strong>Savings Rate:</strong> {savingsPercentage}%
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MonthlyNotes;
