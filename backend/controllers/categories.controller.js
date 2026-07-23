const db = require('../db');
const { validateCategory } = require('../utils/validators');

exports.getCategories = (req, res, next) => {
  try {
    const categories = db.prepare('SELECT id, name, type FROM categories WHERE user_id = ? ORDER BY name ASC').all(req.userId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = (req, res, next) => {
  try {
    const { name, type } = req.body;
    const validation = validateCategory({ name, type });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const result = db.prepare('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)').run(req.userId, name, type);
    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      type
    });
  } catch (err) {
    next(err);
  }
};
