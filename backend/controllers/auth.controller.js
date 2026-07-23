const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validateSignup, validateLogin } = require('../utils/validators');

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense' },
  { name: 'Rent', type: 'expense' },
  { name: 'Travel', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Other', type: 'expense' }
];

exports.signup = (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const validation = validateSignup({ name, email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const result = insertUser.run(name, email, passwordHash);
    const userId = result.lastInsertRowid;

    const insertCategory = db.prepare('INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)');
    const seedCategories = db.transaction(() => {
      for (const cat of DEFAULT_CATEGORIES) {
        insertCategory.run(userId, cat.name, cat.type);
      }
    });
    seedCategories();

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

exports.login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

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
