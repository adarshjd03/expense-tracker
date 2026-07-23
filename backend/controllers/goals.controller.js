const db = require('../db');

exports.getGoals = (req, res, next) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM goals WHERE user_id = ?';
    const params = [req.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const goals = db.prepare(query).all(...params);

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progress: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
    }));

    res.json(goalsWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.createGoal = (req, res, next) => {
  try {
    const { name, target_amount, current_amount, deadline } = req.body;

    if (!name || !target_amount || target_amount <= 0) {
      return res.status(400).json({ error: 'Valid name and target amount > 0 are required.' });
    }

    const currentAmt = current_amount || 0;
    if (currentAmt < 0) {
      return res.status(400).json({ error: 'Current amount cannot be negative.' });
    }

    const result = db.prepare(`
      INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.userId, name, target_amount, currentAmt, deadline || null, 'active');

    const created = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    const goalWithProgress = {
      ...created,
      progress: created.target_amount > 0 ? Math.round((created.current_amount / created.target_amount) * 100) : 0
    };

    res.status(201).json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const target_amount = req.body.target_amount !== undefined ? req.body.target_amount : existing.target_amount;
    const current_amount = req.body.current_amount !== undefined ? req.body.current_amount : existing.current_amount;
    const deadline = req.body.deadline !== undefined ? req.body.deadline : existing.deadline;
    const status = req.body.status !== undefined ? req.body.status : existing.status;

    if (target_amount <= 0) {
      return res.status(400).json({ error: 'Target amount must be greater than 0.' });
    }

    if (current_amount < 0) {
      return res.status(400).json({ error: 'Current amount cannot be negative.' });
    }

    // Auto-complete if target reached
    const finalStatus = current_amount >= target_amount && status === 'active' ? 'completed' : status;

    db.prepare(`
      UPDATE goals 
      SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, status = ?
      WHERE id = ? AND user_id = ?
    `).run(name, target_amount, current_amount, deadline, finalStatus, id, req.userId);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    const goalWithProgress = {
      ...updated,
      progress: updated.target_amount > 0 ? Math.round((updated.current_amount / updated.target_amount) * 100) : 0
    };

    res.json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.contributeToGoal = (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid contribution amount > 0 is required.' });
    }

    const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const newAmount = existing.current_amount + amount;
    const finalStatus = newAmount >= existing.target_amount ? 'completed' : existing.status;

    db.prepare(`
      UPDATE goals 
      SET current_amount = ?, status = ?
      WHERE id = ? AND user_id = ?
    `).run(newAmount, finalStatus, id, req.userId);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    const goalWithProgress = {
      ...updated,
      progress: updated.target_amount > 0 ? Math.round((updated.current_amount / updated.target_amount) * 100) : 0
    };

    res.json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};
