import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import MonthlyReport from './components/MonthlyReport';
import Filters from './components/Filters';
import DailyExpenseTracker from './components/DailyExpenseTracker';
import IncomeManager from './components/IncomeManager';
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Personal Finance Tracker</h1>
        <p>Track your income, expenses, and daily spending with ease</p>
      </header>

      <main className="app-container">
        <div className="sidebar">
          <TransactionForm 
            onSuccess={handleAddSuccess}
            editingTransaction={editingTransaction}
          />
          <IncomeManager />
        </div>

        <div className="main-content">
          <DailyExpenseTracker />
          
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
              <MonthlyNotes />
              <TransactionList 
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
