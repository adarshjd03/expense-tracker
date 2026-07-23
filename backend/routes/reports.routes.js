const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getReport } = require('../controllers/reports.controller');

router.get('/', verifyToken, getReport);

module.exports = router;
