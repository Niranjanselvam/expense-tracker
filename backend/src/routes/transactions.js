import express from 'express';
import * as transactionModel from '../models/transaction.js';

const router = express.Router();

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const transactions = await transactionModel.getAllTransactions(filters);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await transactionModel.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = await transactionModel.createTransaction(
      type,
      category,
      amount,
      description,
      date
    );

    res.status(201).json({ id, type, category, amount, description, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await transactionModel.updateTransaction(
      req.params.id,
      type,
      category,
      amount,
      description,
      date
    );

    res.json({ id: req.params.id, type, category, amount, description, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    await transactionModel.deleteTransaction(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly summary
router.get('/summary/monthly/:year/:month', async (req, res) => {
  try {
    const summary = await transactionModel.getMonthlySummary(
      req.params.year,
      req.params.month
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories by type
router.get('/categories/:type', async (req, res) => {
  try {
    const categories = await transactionModel.getCategories(req.params.type);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export
router.get('/export/csv', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const transactions = await transactionModel.getAllTransactions(filters);

    // Generate CSV content
    let csv = 'Date,Type,Category,Amount,Description\n';
    transactions.forEach(t => {
      csv += `${t.date},"${t.type}","${t.category}",${t.amount},"${t.description || ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
