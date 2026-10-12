import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import '../styles/TransactionForm.css';

const CATEGORY_OPTIONS = {
  income: [
    'Salary',
    'Freelancing',
    'Business',
    'Investments',
    'Rental Income',
    'Interest',
    'Bonus',
    'Other Income',
  ],
  expense: [
    'Food',
    'Transport',
    'Shopping',
    'Rent',
    'Electricity',
    'Water Bill',
    'Internet',
    'Mobile Recharge',
    'Healthcare',
    'Education',
    'Entertainment',
    'Groceries',
    'Travel',
    'Personal Care',
    'EMI / Loan',
    'Insurance',
    'Other Expense',
  ],
};

function TransactionForm({ onSuccess, editingTransaction }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.type) {
      fetchCategories(formData.type);
    }
  }, [formData.type]);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        category: editingTransaction.category || '',
      });
    }
  }, [editingTransaction]);

  const fetchCategories = async (type) => {
    try {
      const response = await transactionAPI.getCategories(type);
      const savedCategories = response.data || [];
      const mergedCategories = [...new Set([
        ...(CATEGORY_OPTIONS[type] || []),
        ...savedCategories,
        ...(formData.category ? [formData.category] : []),
      ])];
      setCategories(mergedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(CATEGORY_OPTIONS[type] || []);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'type' ? { category: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTransaction && editingTransaction.id) {
        await transactionAPI.update(editingTransaction.id, formData);
      } else {
        await transactionAPI.create(formData);
      }

      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      alert('Error saving transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const catList = categories.length > 0 ? categories : CATEGORY_OPTIONS[formData.type] || [];

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h2>{editingTransaction?.id ? 'Edit Transaction' : 'Add Transaction'}</h2>

      <div className="form-group">
        <label>Type:</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="form-group">
        <label>Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          aria-label="Transaction category"
        >
          <option value="">Select a category</option>
          {catList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amount:</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional description"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Transaction'}
      </button>
    </form>
  );
}

export default TransactionForm;
