const { sql } = require('../db');
const { validateTransaction } = require('../utils/validators');

exports.getTransactions = async (req, res, next) => {
  try {
    const { type, category_id, from, to, q } = req.query;
    
    let query = sql`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.user_id = ${req.userId}
    `;

    // Build dynamic query conditions
    let conditions = [`t.user_id = ${req.userId}`];
    
    if (type) {
      conditions.push(`t.type = '${type}'`);
    }
    if (category_id) {
      conditions.push(`t.category_id = ${category_id}`);
    }
    if (from) {
      conditions.push(`t.date >= '${from}'`);
    }
    if (to) {
      conditions.push(`t.date <= '${to}'`);
    }
    if (q) {
      conditions.push(`(t.note ILIKE '%${q}%' OR c.name ILIKE '%${q}%')`);
    }

    const whereClause = conditions.join(' AND ');
    const result = await sql.query(`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE ${whereClause}
      ORDER BY t.date DESC, t.id DESC
    `);

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
      const catResult = await sql`
        SELECT id FROM categories WHERE id = ${categoryId} AND user_id = ${req.userId}
      `;
      if (catResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    const result = await sql`
      INSERT INTO transactions (user_id, category_id, amount, type, note, date) 
      VALUES (${req.userId}, ${categoryId}, ${amount}, ${type}, ${note || ''}, ${date})
      RETURNING id
    `;

    const transactionId = result.rows[0].id;
    const created = await sql`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ${transactionId}
    `;

    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await sql`
      SELECT * FROM transactions WHERE id = ${id} AND user_id = ${req.userId}
    `;

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
      const catResult = await sql`
        SELECT id FROM categories WHERE id = ${category_id} AND user_id = ${req.userId}
      `;
      if (catResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid category for this user.' });
      }
    }

    await sql`
      UPDATE transactions 
      SET amount = ${amount}, type = ${type}, category_id = ${category_id}, 
          note = ${note}, date = ${date}
      WHERE id = ${id} AND user_id = ${req.userId}
    `;

    const updated = await sql`
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id, c.name as category_name 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE t.id = ${id}
    `;

    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM transactions WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

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

    const totalIncomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE user_id = ${userId} AND type = 'income'
    `;
    const totalExpenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE user_id = ${userId} AND type = 'expense'
    `;

    const totalIncome = parseFloat(totalIncomeResult.rows[0].total);
    const totalExpense = parseFloat(totalExpenseResult.rows[0].total);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const byCategoryResult = await sql`
      SELECT COALESCE(c.name, 'Uncategorized') as category, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ${userId} AND t.type = 'expense'
      GROUP BY category
      ORDER BY total DESC
    `;

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

      const incResult = await sql.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE user_id = ${userId} AND type = 'income' AND date::text LIKE '${monthKey}%'
      `);
      const expResult = await sql.query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE user_id = ${userId} AND type = 'expense' AND date::text LIKE '${monthKey}%'
      `);

      byMonth.push({
        month: monthKey,
        income: parseFloat(incResult.rows[0].total),
        expense: parseFloat(expResult.rows[0].total)
      });
    }

    // Average daily spend (last 30 days)
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30Result = await sql`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE user_id = ${userId} AND type = 'expense' AND date >= ${thirtyDaysAgo}
    `;
    const avgDailySpend = parseFloat(last30Result.rows[0].total) / 30;

    // Current month budgets with spending
    const currentMonth = now.toISOString().slice(0, 7);
    const budgetsResult = await sql`
      SELECT b.id, b.category_id, b.amount_limit, c.name as category_name,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id 
        AND t.type = 'expense' 
        AND date::text LIKE (b.month || '%')
      WHERE b.user_id = ${userId} AND b.month = ${currentMonth}
      GROUP BY b.id, b.category_id, b.amount_limit, c.name
    `;

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
