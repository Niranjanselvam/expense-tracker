import { getDatabase, allQuery, runQuery, getQuery } from '../utils/database.js';

// Get all transactions with optional filters
export async function getAllTransactions(filters = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];

  if (filters.type) {
    sql += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.startDate) {
    sql += ' AND date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    sql += ' AND date <= ?';
    params.push(filters.endDate);
  }

  sql += ' ORDER BY date DESC';
  const transactions = await allQuery(db, sql, params);
  db.close();
  return transactions;
}

// Get monthly summary
export async function getMonthlySummary(year, month) {
  const db = getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const sql = `
    SELECT 
      type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM transactions
    WHERE date >= ? AND date <= ?
    GROUP BY type
  `;

  const summary = await allQuery(db, sql, [startDate, endDate]);
  db.close();
  return summary;
}

// Get transaction by ID
export async function getTransactionById(id) {
  const db = getDatabase();
  const transaction = await getQuery(
    db,
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  db.close();
  return transaction;
}

// Create transaction
export async function createTransaction(type, category, amount, description, date) {
  const db = getDatabase();
  const result = await runQuery(
    db,
    `INSERT INTO transactions (type, category, amount, description, date)
     VALUES (?, ?, ?, ?, ?)`,
    [type, category, amount, description, date]
  );
  db.close();
  return result.lastID;
}

// Update transaction
export async function updateTransaction(id, type, category, amount, description, date) {
  const db = getDatabase();
  await runQuery(
    db,
    `UPDATE transactions 
     SET type = ?, category = ?, amount = ?, description = ?, date = ?
     WHERE id = ?`,
    [type, category, amount, description, date, id]
  );
  db.close();
}

// Delete transaction
export async function deleteTransaction(id) {
  const db = getDatabase();
  await runQuery(db, 'DELETE FROM transactions WHERE id = ?', [id]);
  db.close();
}

// Get categories by type
export async function getCategories(type) {
  const db = getDatabase();
  const categories = await allQuery(
    db,
    'SELECT DISTINCT category FROM transactions WHERE type = ? ORDER BY category',
    [type]
  );
  db.close();
  return categories.map(c => c.category);
}
