import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import '../styles/MonthlyReport.css';

function MonthlyReport({ transactions }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadMonthlySummary();
  }, [selectedMonth, transactions]);

  const loadMonthlySummary = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      const response = await transactionAPI.getMonthlySummary(year, month);
      setSummary(response.data);
    } catch (err) {
      console.error('Error loading monthly summary:', err);
    }
  };

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const monthName = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const monthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate.getFullYear() === selectedMonth.getFullYear() &&
           transDate.getMonth() === selectedMonth.getMonth();
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expensesByCategory = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  return (
    <div className="monthly-report">
      <h3>Monthly Report</h3>

      <div className="month-navigation">
        <button onClick={handlePrevMonth}>← Previous</button>
        <span className="month-display">{monthName}</span>
        <button onClick={handleNextMonth}>Next →</button>
      </div>

      <div className="report-summary">
        <div className="report-item income">
          <span>Total Income:</span>
          <span className="amount">${totalIncome.toFixed(2)}</span>
        </div>
        <div className="report-item expense">
          <span>Total Expenses:</span>
          <span className="amount">${totalExpense.toFixed(2)}</span>
        </div>
        <div className={`report-item ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}`}>
          <span>Net Income:</span>
          <span className="amount">${(totalIncome - totalExpense).toFixed(2)}</span>
        </div>
      </div>

      {Object.keys(expensesByCategory).length > 0 && (
        <div className="expense-breakdown">
          <h4>Expense Breakdown</h4>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>${amount.toFixed(2)}</td>
                  <td>{((amount / totalExpense) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MonthlyReport;
