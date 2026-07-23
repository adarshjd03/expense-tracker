const { sql } = require('../db');

exports.getInvestments = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let result;
    if (type) {
      result = await sql`
        SELECT * FROM investments 
        WHERE user_id = ${req.userId} AND type = ${type}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM investments 
        WHERE user_id = ${req.userId}
        ORDER BY created_at DESC
      `;
    }

    // Calculate return on investment for each entry
    const enriched = result.rows.map(inv => {
      const amount = parseFloat(inv.amount);
      const current_value = parseFloat(inv.current_value);
      const roi = amount > 0 ? ((current_value - amount) / amount) * 100 : 0;
      const gain = current_value - amount;
      return { 
        ...inv, 
        amount,
        current_value,
        roi: Math.round(roi * 100) / 100, 
        gain: Math.round(gain * 100) / 100 
      };
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

exports.createInvestment = async (req, res, next) => {
  try {
    const { name, type, amount, current_value, purchase_date, notes } = req.body;

    if (!name || !type || !amount || amount <= 0 || !purchase_date) {
      return res.status(400).json({ error: 'Name, type, amount > 0, and purchase date are required.' });
    }

    const currentVal = current_value !== undefined ? current_value : amount;
    if (currentVal < 0) {
      return res.status(400).json({ error: 'Current value cannot be negative.' });
    }

    const result = await sql`
      INSERT INTO investments (user_id, name, type, amount, current_value, purchase_date, notes)
      VALUES (${req.userId}, ${name}, ${type}, ${amount}, ${currentVal}, ${purchase_date}, ${notes || null})
      RETURNING *
    `;

    const created = result.rows[0];
    const amt = parseFloat(created.amount);
    const currVal = parseFloat(created.current_value);
    const roi = amt > 0 ? ((currVal - amt) / amt) * 100 : 0;

    res.status(201).json({
      ...created,
      amount: amt,
      current_value: currVal,
      roi: Math.round(roi * 100) / 100,
      gain: Math.round((currVal - amt) * 100) / 100
    });
  } catch (err) {
    next(err);
  }
};

exports.updateInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingResult = await sql`
      SELECT * FROM investments WHERE id = ${id} AND user_id = ${req.userId}
    `;

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found.' });
    }

    const existing = existingResult.rows[0];
    const name = req.body.name !== undefined ? req.body.name : existing.name;
    const type = req.body.type !== undefined ? req.body.type : existing.type;
    const amount = req.body.amount !== undefined ? req.body.amount : existing.amount;
    const current_value = req.body.current_value !== undefined ? req.body.current_value : existing.current_value;
    const purchase_date = req.body.purchase_date !== undefined ? req.body.purchase_date : existing.purchase_date;
    const notes = req.body.notes !== undefined ? req.body.notes : existing.notes;

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const result = await sql`
      UPDATE investments 
      SET name = ${name}, type = ${type}, amount = ${amount}, current_value = ${current_value}, 
          purchase_date = ${purchase_date}, notes = ${notes}
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING *
    `;

    const updated = result.rows[0];
    const amt = parseFloat(updated.amount);
    const currVal = parseFloat(updated.current_value);
    const roi = amt > 0 ? ((currVal - amt) / amt) * 100 : 0;

    res.json({
      ...updated,
      amount: amt,
      current_value: currVal,
      roi: Math.round(roi * 100) / 100,
      gain: Math.round((currVal - amt) * 100) / 100
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sql`
      DELETE FROM investments WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
