require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const transactionsRoutes = require('./routes/transactions.routes');
const goalsRoutes = require('./routes/goals.routes');
const investmentsRoutes = require('./routes/investments.routes');
const reportsRoutes = require('./routes/reports.routes');
const { getSummary } = require('./controllers/transactions.controller');
const verifyToken = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.get('/api/summary', verifyToken, getSummary);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handler
app.use(errorHandler);

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error(`   Run this to free it: npx kill-port ${PORT}`);
      console.error(`   Or in PowerShell: Stop-Process -Id (netstat -ano | findstr :${PORT} | ForEach-Object { ($_ -split "\\s+")[-1] }) -Force\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // Graceful shutdown — ensures nodemon restarts release the port cleanly
  const shutdown = () => {
    server.close(() => {
      console.log('Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
