const { query } = require('../db');
const { validateCategory } = require('../utils/validators');

exports.getCategories = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, type FROM categories WHERE user_id = $1 ORDER BY name ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const validation = validateCategory({ name, type });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const result = await query(
      'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id, name, type',
      [req.userId, name, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
