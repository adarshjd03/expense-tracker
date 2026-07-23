const { query } = require('../db');
const { validateTransaction } = require('../utils/validators');

exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category_id, from, to, q } = req.query;
    
    let sql = `
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = $1
    `;
    const params = [req.userId];
    let paramIndex = 2;

    if (type) {
      sql += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (category_id) {
      sql += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }
    if (from) {
      sql += ` AND t.date >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }
    if (to) {
      sql += ` AND t.date <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }
    if (q) {
      sql += ` AND (t.note ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    sql += ' ORDER BY t.date DESC, t.id DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category_id, note, date } = req.body;
    const validation = validateTransaction({ amount, type, date });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    let categoryId = category_id || null;
    if (categoryId) {
      const catResult = await query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [categoryId, req.userId]
      );
      if (catResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    const result = await query(
      'INSERT INTO transactions (user_id, category_id, amount, type, note, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.userId, categoryId, amount, type, note || '', date]
    );

    const transactionId = result.rows[0].id;
    const created = await query(
      `SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.id = $1`,
      [transactionId]
    );

    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const existingTx = existing.rows[0];
    const amount = req.body.amount !== undefined ? req.body.amount : existingTx.amount;
    const type = req.body.type !== undefined ? req.body.type : existingTx.type;
    const category_id = req.body.category_id !== undefined ? req.body.category_id : existingTx.category_id;
    const note = req.body.note !== undefined ? req.body.note : existingTx.note;
    const date = req.body.date !== undefined ? req.body.date : existingTx.date;

    const validation = validateTransaction({ amount, type, date });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    if (category_id) {
      const catResult = await query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category_id, req.userId]
      );
      if (catResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    await query(
      'UPDATE transactions SET amount = $1, type = $2, category_id = $3, note = $4, date = $5 WHERE id = $6 AND user_id = $7',
      [amount, type, category_id, note, date, id, req.userId]
    );

    const updated = await query(
      `SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.id = $1`,
      [id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.userId;

    const totalIncomeResult = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'income'",
      [userId]
    );
    const totalExpenseResult = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense'",
      [userId]
    );

    const totalIncome = parseFloat(totalIncomeResult.rows[0].total);
    const totalExpense = parseFloat(totalExpenseResult.rows[0].total);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const byCategoryResult = await query(
      `SELECT COALESCE(c.name, 'Uncategorized') as category, SUM(t.amount) as total
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    const byCategory = byCategoryResult.rows.map(row => ({
      category: row.category,
      total: parseFloat(row.total)
    }));

    // Get last 6 months summary
    const byMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yearStr}-${monthStr}`;

      const incResult = await query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'income' AND to_char(date, 'YYYY-MM') = $2",
        [userId, monthKey]
      );
      const expResult = await query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense' AND to_char(date, 'YYYY-MM') = $2",
        [userId, monthKey]
      );

      byMonth.push({
        month: monthKey,
        income: parseFloat(incResult.rows[0].total),
        expense: parseFloat(expResult.rows[0].total)
      });
    }

    // Average daily spend (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30Result = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = 'expense' AND date >= $2",
      [userId, thirtyDaysAgo]
    );
    const avgDailySpend = parseFloat(last30Result.rows[0].total) / 30;

    // Current month budgets with spending
    const currentMonth = now.toISOString().slice(0, 7);
    const budgetsResult = await query(
      `SELECT b.id, b.category_id, b.amount_limit, c.name as category_name,
              COALESCE(SUM(t.amount), 0) as spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       LEFT JOIN transactions t ON t.category_id = b.category_id 
         AND t.user_id = b.user_id 
         AND t.type = 'expense' 
         AND to_char(t.date, 'YYYY-MM') = b.month
       WHERE b.user_id = $1 AND b.month = $2
       GROUP BY b.id, b.category_id, b.amount_limit, c.name`,
      [userId, currentMonth]
    );

    const budgets = budgetsResult.rows.map(row => ({
      ...row,
      amount_limit: parseFloat(row.amount_limit),
      spent: parseFloat(row.spent)
    }));

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
