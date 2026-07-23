const { query } = require('../db');

exports.getReport = async (req, res, next) => {
  try {
    const { from, to, type, category_id } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Start date (from) and end date (to) are required.' });
    }

    // Build base transaction query
    let sql = `
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id,
             COALESCE(c.name, 'Uncategorized') as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.date >= $2 AND t.date <= $3
    `;
    const params = [req.userId, from, to];
    let paramIndex = 4;

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

    sql += ' ORDER BY t.date DESC, t.id DESC';

    const result = await query(sql, params);
    const transactions = result.rows.map(t => ({
      ...t,
      amount: parseFloat(t.amount)
    }));

    // Totals for the period
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const net = totalIncome - totalExpense;

    // Spending by category (expenses only)
    const byCategoryMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category_name;
        if (!byCategoryMap[cat]) byCategoryMap[cat] = 0;
        byCategoryMap[cat] += t.amount;
      });

    const byCategory = Object.entries(byCategoryMap)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Daily breakdown
    const byDayMap = {};
    transactions.forEach(t => {
      const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 10) : String(t.date).slice(0, 10);
      if (!byDayMap[dateStr]) byDayMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
      if (t.type === 'income') byDayMap[dateStr].income += t.amount;
      else byDayMap[dateStr].expense += t.amount;
    });

    const byDay = Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date));

    // Monthly breakdown
    const byMonthMap = {};
    transactions.forEach(t => {
      const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0, 7) : String(t.date).slice(0, 7);
      if (!byMonthMap[dateStr]) byMonthMap[dateStr] = { month: dateStr, income: 0, expense: 0 };
      if (t.type === 'income') byMonthMap[dateStr].income += t.amount;
      else byMonthMap[dateStr].expense += t.amount;
    });

    const byMonth = Object.values(byMonthMap).sort((a, b) => a.month.localeCompare(b.month));

    // Top expenses
    const topExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json({
      period: { from, to },
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        net: Math.round(net * 100) / 100,
        transactionCount: transactions.length,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 1000) / 10 : 0
      },
      byCategory,
      byDay,
      byMonth,
      topExpenses,
      transactions
    });
  } catch (err) {
    next(err);
  }
};
