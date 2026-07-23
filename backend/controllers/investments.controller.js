const db = require('../db');

exports.getInvestments = (req, res, next) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM investments WHERE user_id = ?';
    const params = [req.userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const investments = db.prepare(query).all(...params);

    // Calculate return on investment for each entry
    const enriched = investments.map(inv => {
      const roi = inv.amount > 0 ? ((inv.current_value - inv.amount) / inv.amount) * 100 : 0;
      const gain = inv.current_value - inv.amount;
      return { ...inv, roi: Math.round(roi * 100) / 100, gain: Math.round(gain * 100) / 100 };
    });

    // Portfolio summary
    const totalInvested = enriched.reduce((sum, i) => sum + i.amount, 0);
    const totalCurrentValue = enriched.reduce((sum, i) => sum + i.current_value, 0);
    const totalGain = totalCurrentValue - totalInvested;
    const totalRoi = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;

    res.json({
      investments: enriched,
      summary: {
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
        totalGain: Math.round(totalGain * 100) / 100,
        totalRoi: Math.round(totalRoi * 100) / 100
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createInvestment = (req, res, next) => {
  try {
    const { name, type, amount, current_value, purchase_date, notes } = req.body;

    if (!name || !type || !amount || amount <= 0 || !purchase_date) {
      return res.status(400).json({ error: 'Name, type, amount > 0, and purchase date are required.' });
    }

    const currentVal = current_value !== undefined ? current_value : amount;
    if (currentVal < 0) {
      return res.status(400).json({ error: 'Current value cannot be negative.' });
    }

    const result = db.prepare(`
      INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.userId, name, type, amount, currentVal, purchase_date, notes || null);

    const created = db.prepare('SELECT * FROM investments WHERE id = ?').get(result.lastInsertRowid);
    const roi = created.amount > 0 ? ((created.current_value - created.amount) / created.amount) * 100 : 0;

    res.status(201).json({
      ...created,
      roi: Math.round(roi * 100) / 100,
      gain: Math.round((created.current_value - created.amount) * 100) / 100
    });
  } catch (err) {
    next(err);
  }
};

exports.updateInvestment = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(id, req.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Investment not found.' });
    }

    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const type = req.body.type !== undefined ? req.body.type : existing.type;
    const amount = req.body.amount !== undefined ? req.body.amount : existing.amount;
    const current_value = req.body.current_value !== undefined ? req.body.current_value : existing.current_value;
    const purchase_date = req.body.purchase_date !== undefined ? req.body.purchase_date : existing.purchase_date;
    const notes = req.body.notes !== undefined ? req.body.notes : existing.notes;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    db.prepare(`
      UPDATE investments 
      SET name = ?, type = ?, amount = ?, current_value = ?, purchase_date = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `).run(name, type, amount, current_value, purchase_date, notes, id, req.userId);

    const updated = db.prepare('SELECT * FROM investments WHERE id = ?').get(id);
    const roi = updated.amount > 0 ? ((updated.current_value - updated.amount) / updated.amount) * 100 : 0;

    res.json({
      ...updated,
      roi: Math.round(roi * 100) / 100,
      gain: Math.round((updated.current_value - updated.amount) * 100) / 100
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteInvestment = (req, res, next) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM investments WHERE id = ? AND user_id = ?').run(id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Investment not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
