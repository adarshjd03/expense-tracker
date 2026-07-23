const db = require('../db');

exports.getReport = (req, res, next) => {
  try {
    const { from, to, type, category_id } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Start date (from) and end date (to) are required.' });
    }

    // Build base transaction query
    let txQuery = `
      SELECT t.id, t.amount, t.type, t.note, t.date, t.category_id,
             COALESCE(c.name, 'Uncategorized') as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? AND t.date >= ? AND t.date <= ?
    `;
    const txParams = [req.userId, from, to];

    if (type) {
      txQuery += ' AND t.type = ?';
      txParams.push(type);
    }
    if (category_id) {
      txQuery += ' AND t.category_id = ?';
      txParams.push(category_id);
    }

    txQuery += ' ORDER BY t.date DESC, t.id DESC';

    const transactions = db.prepare(txQuery).all(...txParams);

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
      if (!byDayMap[t.date]) byDayMap[t.date] = { date: t.date, income: 0, expense: 0 };
      if (t.type === 'income') byDayMap[t.date].income += t.amount;
      else byDayMap[t.date].expense += t.amount;
    });

    const byDay = Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date));

    // Monthly breakdown
    const byMonthMap = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!byMonthMap[month]) byMonthMap[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') byMonthMap[month].income += t.amount;
      else byMonthMap[month].expense += t.amount;
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
