const db = require('../db');
const { validateTransaction } = require('../utils/validators');

exports.getTransactions = (req, res, next) => {
  try {
    const { type, category_id, from, to, q } = req.query;
    let query = `
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ?
    `;
    const params = [req.userId];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (from) {
      query += ' AND t.date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND t.date <= ?';
      params.push(to);
    }
    if (q) {
      query += ' AND (t.note LIKE ? OR c.name LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    query += ' ORDER BY t.date DESC, t.id DESC';

    const transactions = db.prepare(query).all(...params);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = (req, res, next) => {
  try {
    const { amount, type, category_id, note, date } = req.body;
    const validation = validateTransaction({ amount, type, date });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    let categoryId = category_id || null;
    if (categoryId) {
      const cat = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(categoryId, req.userId);
      if (!cat) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    const result = db.prepare(
      'INSERT INTO transactions (user_id, category_id, amount, type, note, date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.userId, categoryId, amount, type, note || '', date);

    const created = db.prepare(`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const amount = req.body.amount !== undefined ? req.body.amount : existing.amount;
    const type = req.body.type !== undefined ? req.body.type : existing.type;
    const category_id = req.body.category_id !== undefined ? req.body.category_id : existing.category_id;
    const note = req.body.note !== undefined ? req.body.note : existing.note;
    const date = req.body.date !== undefined ? req.body.date : existing.date;

    const validation = validateTransaction({ amount, type, date });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    if (category_id) {
      const cat = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(category_id, req.userId);
      if (!cat) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    db.prepare(`
      UPDATE transactions 
      SET amount = ?, type = ?, category_id = ?, note = ?, date = ? 
      WHERE id = ? AND user_id = ?
    `).run(amount, type, category_id, note, date, id, req.userId);

    const updated = db.prepare(`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ?
    `).get(id);

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = (req, res, next) => {
  try {
    const userId = req.userId;

    const totalIncomeRow = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income'").get(userId);
    const totalExpenseRow = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense'").get(userId);

    const totalIncome = totalIncomeRow.total;
    const totalExpense = totalExpenseRow.total;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const byCategory = db.prepare(`
      SELECT COALESCE(c.name, 'Uncategorized') as category, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.type = 'expense'
      GROUP BY category
      ORDER BY total DESC
    `).all(userId);

    // Get last 6 months summary
    const byMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yearStr}-${monthStr}`;

      const incRow = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND date LIKE ?").get(userId, `${monthKey}%`);
      const expRow = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date LIKE ?").get(userId, `${monthKey}%`);

      byMonth.push({
        month: monthKey,
        income: incRow.total,
        expense: expRow.total
      });
    }

    // Average daily spend (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30Row = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date >= ?").get(userId, thirtyDaysAgo);
    const avgDailySpend = last30Row.total / 30;

    // Current month budgets with spending
    const currentMonth = now.toISOString().slice(0, 7);
    const budgets = db.prepare(`
      SELECT b.id, b.category_id, b.amount_limit, c.name as category_name,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id 
        AND t.type = 'expense' 
        AND t.date LIKE (b.month || '%')
      WHERE b.user_id = ? AND b.month = ?
      GROUP BY b.id
    `).all(userId, currentMonth);

    res.json({
      totalIncome,
      totalExpense,
      balance,
      savingsRate: Math.round(savingsRate * 10) / 10,
      avgDailySpend: Math.round(avgDailySpend * 100) / 100,
      byCategory,
      byMonth,
      budgets
    });
  } catch (err) {
    next(err);
  }
};
