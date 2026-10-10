import { getDatabase, allQuery, runQuery, getQuery } from '../utils/database.js';

// Daily Expense Operations

export async function getAllDailyExpenses(date = null) {
  const db = getDatabase();
  let sql = 'SELECT * FROM daily_expenses WHERE 1=1';
  const params = [];

  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  }

  sql += ' ORDER BY date DESC, stop_time DESC';
  const expenses = await allQuery(db, sql, params);
  db.close();
  return expenses;
}

export async function getActiveDailyExpense() {
  const db = getDatabase();
  const expense = await getQuery(
    db,
    'SELECT * FROM daily_expenses WHERE is_active = 1 LIMIT 1'
  );
  db.close();
  return expense;
}

export async function getTodayDailyExpenses() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const expenses = await allQuery(
    db,
    'SELECT * FROM daily_expenses WHERE date = ? ORDER BY stop_time DESC',
    [today]
  );
  db.close();
  return expenses;
}

export async function startDailyExpense(date, category = 'Daily') {
  const db = getDatabase();
  const result = await runQuery(
    db,
    `INSERT INTO daily_expenses (date, amount, category, is_active, start_time)
     VALUES (?, ?, ?, ?, ?)`,
    [date, 0, category, 1, new Date().toISOString()]
  );
  db.close();
  return result.lastID;
}

export async function stopDailyExpense(id, amount, description = '') {
  const db = getDatabase();
  const currentDate = new Date().toISOString().split('T')[0];
  await runQuery(
    db,
    `UPDATE daily_expenses 
     SET is_active = 0, amount = ?, stop_time = ?, description = ?, date = ?
     WHERE id = ?`,
    [amount, new Date().toISOString(), description, currentDate, id]
  );
  db.close();
}

export async function updateDailyExpense(id, amount, description, category) {
  const db = getDatabase();
  await runQuery(
    db,
    `UPDATE daily_expenses 
     SET amount = ?, description = ?, category = ?
     WHERE id = ?`,
    [amount, description, category, id]
  );
  db.close();
}

export async function deleteDailyExpense(id) {
  const db = getDatabase();
  await runQuery(db, 'DELETE FROM daily_expenses WHERE id = ?', [id]);
  db.close();
}

// Income Operations

export async function getAllIncome(filters = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM income WHERE 1=1';
  const params = [];

  if (filters.startDate) {
    sql += ' AND date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ' AND date <= ?';
    params.push(filters.endDate);
  }

  if (filters.source) {
    sql += ' AND source = ?';
    params.push(filters.source);
  }

  sql += ' ORDER BY date DESC';
  const income = await allQuery(db, sql, params);
  db.close();
  return income;
}

export async function getMonthlyIncome(year, month) {
  const db = getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const sql = `
    SELECT 
      source,
      SUM(amount) as total,
      COUNT(*) as count
    FROM income
    WHERE date >= ? AND date <= ?
    GROUP BY source
  `;

  const income = await allQuery(db, sql, [startDate, endDate]);
  db.close();
  return income;
}

export async function getTotalMonthlyIncome(year, month) {
  const db = getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const sql = `
    SELECT SUM(amount) as total
    FROM income
    WHERE date >= ? AND date <= ?
  `;

  const result = await getQuery(db, sql, [startDate, endDate]);
  db.close();
  return result?.total || 0;
}

export async function addIncome(date, amount, source, description = '') {
  const db = getDatabase();
  const result = await runQuery(
    db,
    `INSERT INTO income (date, amount, source, description)
     VALUES (?, ?, ?, ?)`,
    [date, amount, source, description]
  );
  db.close();
  return result.lastID;
}

export async function updateIncome(id, date, amount, source, description = '') {
  const db = getDatabase();
  await runQuery(
    db,
    `UPDATE income 
     SET date = ?, amount = ?, source = ?, description = ?
     WHERE id = ?`,
    [date, amount, source, description, id]
  );
  db.close();
}

export async function deleteIncome(id) {
  const db = getDatabase();
  await runQuery(db, 'DELETE FROM income WHERE id = ?', [id]);
  db.close();
}

// Monthly Notes Operations

export async function getMonthlyNote(year, month) {
  const db = getDatabase();
  const note = await getQuery(
    db,
    'SELECT * FROM monthly_notes WHERE year = ? AND month = ?',
    [year, month]
  );
  db.close();
  return note;
}

export async function createOrUpdateMonthlyNote(year, month, totalIncome, totalExpense, notes) {
  const db = getDatabase();
  const existing = await getQuery(
    db,
    'SELECT id FROM monthly_notes WHERE year = ? AND month = ?',
    [year, month]
  );

  if (existing) {
    await runQuery(
      db,
      `UPDATE monthly_notes 
       SET total_income = ?, total_expense = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE year = ? AND month = ?`,
      [totalIncome, totalExpense, notes, year, month]
    );
  } else {
    await runQuery(
      db,
      `INSERT INTO monthly_notes (year, month, total_income, total_expense, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [year, month, totalIncome, totalExpense, notes]
    );
  }
  db.close();
}
