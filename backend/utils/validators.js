/**
 * Simple input validation helpers.
 * Return { valid: true } or { valid: false, message: "..." }
 */

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateSignup({ name, email, password }) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, message: 'Name is required.' };
  }
  if (!email || !validateEmail(email)) {
    return { valid: false, message: 'A valid email is required.' };
  }
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  return { valid: true };
}

function validateLogin({ email, password }) {
  if (!email || !validateEmail(email)) {
    return { valid: false, message: 'A valid email is required.' };
  }
  if (!password || password.length === 0) {
    return { valid: false, message: 'Password is required.' };
  }
  return { valid: true };
}

function validateTransaction({ amount, type, date }) {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, message: 'Amount must be a positive number.' };
  }
  if (!type || !['income', 'expense'].includes(type)) {
    return { valid: false, message: "Type must be 'income' or 'expense'." };
  }
  if (!date || isNaN(Date.parse(date))) {
    return { valid: false, message: 'A valid date is required (YYYY-MM-DD).' };
  }
  return { valid: true };
}

function validateCategory({ name, type }) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { valid: false, message: 'Category name is required.' };
  }
  if (!type || !['income', 'expense'].includes(type)) {
    return { valid: false, message: "Type must be 'income' or 'expense'." };
  }
  return { valid: true };
}

module.exports = {
  validateSignup,
  validateLogin,
  validateTransaction,
  validateCategory,
};
