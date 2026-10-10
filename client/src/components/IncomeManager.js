import React, { useState, useEffect } from 'react';
import { incomeAPI } from '../services/api';
import '../styles/IncomeManager.css';

function IncomeManager() {
  const [incomeList, setIncomeList] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: 'Salary',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sources = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other'];

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const response = await incomeAPI.getAll();
      setIncomeList(response.data);
    } catch (err) {
      console.error('Error fetching income:', err);
      alert('Error loading income: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddIncome = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingId) {
        await incomeAPI.update(editingId, data);
        setEditingId(null);
      } else {
        await incomeAPI.create(data);
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        source: 'Salary',
        description: '',
      });

      fetchIncome();
    } catch (err) {
      alert('Error saving income: ' + err.message);
    }
  };

  const handleEditIncome = (income) => {
    setFormData({
      date: income.date,
      amount: income.amount.toString(),
      source: income.source,
      description: income.description || '',
    });
    setEditingId(income.id);
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeAPI.delete(id);
        fetchIncome();
      } catch (err) {
        alert('Error deleting income: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      source: 'Salary',
      description: '',
    });
  };

  const getTotalIncome = () => {
    return incomeList.reduce((sum, income) => sum + (income.amount || 0), 0).toFixed(2);
  };

  const getIncomeBySource = () => {
    const grouped = {};
    incomeList.forEach((income) => {
      if (!grouped[income.source]) {
        grouped[income.source] = 0;
      }
      grouped[income.source] += income.amount;
    });
    return grouped;
  };

  return (
    <div className="income-manager">
      <h2>💵 Income Manager</h2>

      {/* Summary Stats */}
      <div className="income-summary">
        <div className="summary-card">
          <span className="label">Total Income:</span>
          <span className="value">₹ {getTotalIncome()}</span>
        </div>
        <div className="summary-card">
          <span className="label">Transactions:</span>
          <span className="value">{incomeList.length}</span>
        </div>
      </div>

      {/* Form */}
      <div className="income-form">
        <h3>{editingId ? 'Edit Income' : 'Add Income'}</h3>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
          />
        </div>

        <div className="form-group">
          <label>Source:</label>
          <select name="source" value={formData.source} onChange={handleInputChange}>
            {sources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description"
          />
        </div>

        <div className="form-actions">
          <button className="submit-btn" onClick={handleAddIncome}>
            {editingId ? 'Update Income' : 'Add Income'}
          </button>
          {editingId && (
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Income by Source */}
      <div className="income-breakdown">
        <h3>Income by Source</h3>
        <div className="breakdown-cards">
          {Object.entries(getIncomeBySource()).map(([source, amount]) => (
            <div key={source} className="breakdown-card">
              <span className="source">{source}</span>
              <span className="amount">₹ {amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Income List */}
      {incomeList.length > 0 && (
        <div className="income-list">
          <h3>All Income Entries</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomeList.map((income) => (
                <tr key={income.id}>
                  <td>{income.date}</td>
                  <td>{income.source}</td>
                  <td className="amount">₹ {income.amount.toFixed(2)}</td>
                  <td>{income.description || '-'}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditIncome(income)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteIncome(income.id)}
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

      {loading && <p className="loading">Loading income data...</p>}
    </div>
  );
}

export default IncomeManager;
