const { sql } = require('../db');

exports.getGoals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let result;
    if (status) {
      result = await sql`
        SELECT * FROM goals 
        WHERE user_id = ${req.userId} AND status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM goals 
        WHERE user_id = ${req.userId}
        ORDER BY created_at DESC
      `;
    }

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

    const result = await sql`
      INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, status)
      VALUES (${req.userId}, ${name}, ${target_amount}, ${currentAmt}, ${deadline || null}, 'active')
      RETURNING *
    `;

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
    const existingResult = await sql`
      SELECT * FROM goals WHERE id = ${id} AND user_id = ${req.userId}
    `;

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

    const result = await sql`
      UPDATE goals 
      SET name = ${name}, target_amount = ${target_amount}, current_amount = ${current_amount}, 
          deadline = ${deadline}, status = ${finalStatus}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING *
    `;

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
    const result = await sql`
      DELETE FROM goals WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

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

    const existingResult = await sql`
      SELECT * FROM goals WHERE id = ${id} AND user_id = ${req.userId}
    `;

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    const existing = existingResult.rows[0];
    const newAmount = parseFloat(existing.current_amount) + parseFloat(amount);
    const finalStatus = newAmount >= existing.target_amount ? 'completed' : existing.status;

    const result = await sql`
      UPDATE goals 
      SET current_amount = ${newAmount}, status = ${finalStatus}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING *
    `;

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
