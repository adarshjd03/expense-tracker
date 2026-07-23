const { query } = require('../db');

exports.getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let sql = 'SELECT * FROM goals WHERE user_id = $1';
    const params = [req.userId];
    
    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);

    // Calculate progress percentage for each goal
    const goalsWithProgress = result.rows.map(goal => ({
      ...goal,
      target_amount: parseFloat(goal.target_amount),
      current_amount: parseFloat(goal.current_amount),
      progress: goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0
    }));

    res.json(goalsWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, target_amount, current_amount, deadline } = req.body;

    if (!name || !target_amount || target_amount <= 0) {
      return res.status(400).json({ error: 'Valid name and target amount > 0 are required.' });
    }

    const currentAmt = current_amount || 0;
    if (currentAmt < 0) {
      return res.status(400).json({ error: 'Current amount cannot be negative.' });
    }

    const result = await query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [req.userId, name, target_amount, currentAmt, deadline || null]
    );

    const created = result.rows[0];
    const goalWithProgress = {
      ...created,
      target_amount: parseFloat(created.target_amount),
      current_amount: parseFloat(created.current_amount),
      progress: created.target_amount > 0 ? Math.round((created.current_amount / created.target_amount) * 100) : 0
    };

    res.status(201).json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingResult = await query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const existing = existingResult.rows[0];
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

    const result = await query(
      `UPDATE goals 
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, status = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, target_amount, current_amount, deadline, finalStatus, id, req.userId]
    );

    const updated = result.rows[0];
    const goalWithProgress = {
      ...updated,
      target_amount: parseFloat(updated.target_amount),
      current_amount: parseFloat(updated.current_amount),
      progress: updated.target_amount > 0 ? Math.round((updated.current_amount / updated.target_amount) * 100) : 0
    };

    res.json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.contributeToGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid contribution amount > 0 is required.' });
    }

    const existingResult = await query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const existing = existingResult.rows[0];
    const newAmount = parseFloat(existing.current_amount) + parseFloat(amount);
    const finalStatus = newAmount >= existing.target_amount ? 'completed' : existing.status;

    const result = await query(
      `UPDATE goals 
       SET current_amount = $1, status = $2
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [newAmount, finalStatus, id, req.userId]
    );

    const updated = result.rows[0];
    const goalWithProgress = {
      ...updated,
      target_amount: parseFloat(updated.target_amount),
      current_amount: parseFloat(updated.current_amount),
      progress: updated.target_amount > 0 ? Math.round((updated.current_amount / updated.target_amount) * 100) : 0
    };

    res.json(goalWithProgress);
  } catch (err) {
    next(err);
  }
};
