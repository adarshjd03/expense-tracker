const { sql } = require('../db');
const { validateCategory } = require('../utils/validators');

exports.getCategories = async (req, res, next) => {
  try {
    const result = await sql`
      SELECT id, name, type 
      FROM categories 
      WHERE user_id = ${req.userId} 
      ORDER BY name ASC
    `;
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

    const result = await sql`
      INSERT INTO categories (user_id, name, type) 
      VALUES (${req.userId}, ${name}, ${type})
      RETURNING id, name, type
    `;
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
