import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import MonthlyReport from './components/MonthlyReport';
import Filters from './components/Filters';
import MonthlyNotes from './components/MonthlyNotes';
import { transactionAPI } from './services/api';
import './styles/App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll(filters);
      setTransactions(response.data);
    } catch (err) {
      alert('Error loading transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleAddSuccess = () => {
    setEditingTransaction(null);
    fetchTransactions();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions();
      } catch (err) {
        alert('Error deleting transaction: ' + err.message);
      }
    }
  };

  const handleExportCSV = async (exportFilters) => {
    try {
      const response = await transactionAPI.exportCSV(exportFilters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      alert('Error exporting CSV: ' + err.message);
    }
  };

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  const spendingByCategory = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(transaction.amount || 0);
      return acc;
    }, {});

  const topCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0];
  const spendingRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div>
            <p className="eyebrow">Finance overview</p>
            <h1>💰 Personal Finance Tracker</h1>
          </div>
          <div className="live-pill">
            <span className="live-dot"></span>
            Live overview
          </div>
        </div>
      </header>

      <main className="app-container">
        <aside className="sidebar">
          <TransactionForm 
            onSuccess={handleAddSuccess}
            editingTransaction={editingTransaction}
          />

          {loading ? (
            <p className="loading sidebar-loading">Loading transactions...</p>
          ) : (
            <TransactionList 
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          )}
        </aside>

        <section className="main-content">
          <div className="dashboard-overview">
            <div className="overview-card income-card">
              <div className="card-topline">
                <span>Income</span>
                <span className="badge positive">+{totalIncome > 0 ? '100%' : '0%'}</span>
              </div>
              <div className="card-value">${totalIncome.toFixed(2)}</div>
              <p>Cash flowing in this period</p>
            </div>

            <div className="overview-card expense-card">
              <div className="card-topline">
                <span>Expenses</span>
                <span className="badge neutral">{spendingRate.toFixed(0)}%</span>
              </div>
              <div className="card-value">${totalExpenses.toFixed(2)}</div>
              <p>Current spending footprint</p>
            </div>

            <div className="overview-card balance-card">
              <div className="card-topline">
                <span>Net balance</span>
                <span className={`badge ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                  {netBalance >= 0 ? 'Healthy' : 'Watch'}
                </span>
              </div>
              <div className="card-value">${netBalance.toFixed(2)}</div>
              <p>{netBalance >= 0 ? 'On track to save more.' : 'Spending is above income.'}</p>
            </div>
          </div>

          <div className="insight-panel">
            <div>
              <p className="eyebrow">Smart insight</p>
              <h3>
                {topCategory
                  ? `${topCategory[0]} is your biggest category at $${topCategory[1].toFixed(2)}`
                  : 'Add a transaction to reveal your spending patterns'}
              </h3>
            </div>
          </div>

          <Filters 
            onFilterChange={handleFilterChange}
            onExportCSV={handleExportCSV}
          />

          {loading ? (
            <p className="loading">Loading transactions...</p>
          ) : (
            <>
              <Charts transactions={transactions} />
              <MonthlyReport transactions={transactions} />
              <MonthlyNotes transactions={transactions} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
