import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import '../styles/Charts.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Charts({ transactions }) {
  // Calculate totals by type
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Pie chart data
  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expenses],
      backgroundColor: ['#4CAF50', '#FF6B6B'],
      borderColor: ['#45a049', '#cc5555'],
      borderWidth: 2,
    }],
  };

  // Group by category for pie charts
  const incomeByCategory = {};
  const expenseByCategory = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  const expenseCategoryData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2'
      ],
      borderWidth: 2,
    }],
  };

  // Line chart data (by date)
  const dateData = {};
  transactions.forEach(t => {
    if (!dateData[t.date]) {
      dateData[t.date] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      dateData[t.date].income += t.amount;
    } else {
      dateData[t.date].expense += t.amount;
    }
  });

  const sortedDates = Object.keys(dateData).sort();
  const lineData = {
    labels: sortedDates.slice(-30), // Last 30 days
    datasets: [
      {
        label: 'Income',
        data: sortedDates.slice(-30).map(d => dateData[d].income),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: sortedDates.slice(-30).map(d => dateData[d].expense),
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="charts-container">
      <h3>Financial Overview</h3>
      <div className="summary-stats">
        <div className="stat-box income">
          <div className="label">Total Income</div>
          <div className="amount">${income.toFixed(2)}</div>
        </div>
        <div className="stat-box expense">
          <div className="label">Total Expenses</div>
          <div className="amount">${expenses.toFixed(2)}</div>
        </div>
        <div className={`stat-box ${income - expenses >= 0 ? 'positive' : 'negative'}`}>
          <div className="label">Balance</div>
          <div className="amount">${(income - expenses).toFixed(2)}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-wrapper">
          <h4>Income vs Expenses</h4>
          <Pie data={pieData} options={chartOptions} />
        </div>

        {Object.keys(expenseByCategory).length > 0 && (
          <div className="chart-wrapper">
            <h4>Expenses by Category</h4>
            <Pie data={expenseCategoryData} options={chartOptions} />
          </div>
        )}

        <div className="chart-wrapper full-width">
          <h4>Trend (Last 30 Days)</h4>
          <Line data={lineData} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }} />
        </div>
      </div>
    </div>
  );
}

export default Charts;
