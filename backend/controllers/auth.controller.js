const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');
const { validateSignup, validateLogin } = require('../utils/validators');

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense' },
  { name: 'Rent', type: 'expense' },
  { name: 'Travel', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Other', type: 'expense' }
];

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const validation = validateSignup({ name, email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await sql`
      INSERT INTO users (name, email, password_hash) 
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id
    `;
    const userId = result.rows[0].id;

    // Insert default categories for the new user
    for (const cat of DEFAULT_CATEGORIES) {
      await sql`
        INSERT INTO categories (user_id, name, type) 
        VALUES (${userId}, ${cat.name}, ${cat.type})
      `;
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};
