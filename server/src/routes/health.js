const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Returns server health status
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
