import express from 'express';
import * as dailyExpenseModel from '../models/dailyExpense.js';

const router = express.Router();

// Daily Expense Routes

router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const expenses = await dailyExpenseModel.getAllDailyExpenses(date);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/daily/today', async (req, res) => {
  try {
    const expenses = await dailyExpenseModel.getTodayDailyExpenses();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/daily/active', async (req, res) => {
  try {
    const expense = await dailyExpenseModel.getActiveDailyExpense();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/daily/start', async (req, res) => {
  try {
    const { date, category } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const id = await dailyExpenseModel.startDailyExpense(date || today, category);
    res.status(201).json({ id, date: date || today, amount: 0, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/daily/stop/:id', async (req, res) => {
  try {
    const { amount, description } = req.body;
    await dailyExpenseModel.stopDailyExpense(req.params.id, amount, description);
    res.json({ message: 'Daily expense stopped', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/daily/:id', async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    await dailyExpenseModel.updateDailyExpense(req.params.id, amount, description, category);
    res.json({ id: req.params.id, amount, description, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/daily/:id', async (req, res) => {
  try {
    await dailyExpenseModel.deleteDailyExpense(req.params.id);
    res.json({ message: 'Daily expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Income Routes

router.get('/income', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      source: req.query.source,
    };
    const income = await dailyExpenseModel.getAllIncome(filters);
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/income/monthly/:year/:month', async (req, res) => {
  try {
    const income = await dailyExpenseModel.getMonthlyIncome(
      parseInt(req.params.year),
      parseInt(req.params.month)
    );
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/income/total/:year/:month', async (req, res) => {
  try {
    const total = await dailyExpenseModel.getTotalMonthlyIncome(
      parseInt(req.params.year),
      parseInt(req.params.month)
    );
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/income', async (req, res) => {
  try {
    const { date, amount, source, description } = req.body;

    if (!date || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = await dailyExpenseModel.addIncome(date, amount, source, description);
    res.status(201).json({ id, date, amount, source, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/income/:id', async (req, res) => {
  try {
    const { date, amount, source, description } = req.body;

    if (!date || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await dailyExpenseModel.updateIncome(req.params.id, date, amount, source, description);
    res.json({ id: req.params.id, date, amount, source, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/income/:id', async (req, res) => {
  try {
    await dailyExpenseModel.deleteIncome(req.params.id);
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly Notes Routes

router.get('/notes/:year/:month', async (req, res) => {
  try {
    const note = await dailyExpenseModel.getMonthlyNote(
      parseInt(req.params.year),
      parseInt(req.params.month)
    );
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { year, month, totalIncome, totalExpense, notes } = req.body;

    if (!year || !month) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await dailyExpenseModel.createOrUpdateMonthlyNote(year, month, totalIncome, totalExpense, notes);
    res.json({ year, month, totalIncome, totalExpense, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
