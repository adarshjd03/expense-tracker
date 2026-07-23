const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const investmentsController = require('../controllers/investments.controller');

router.use(verifyToken);

router.get('/', investmentsController.getInvestments);
router.post('/', investmentsController.createInvestment);
router.put('/:id', investmentsController.updateInvestment);
router.delete('/:id', investmentsController.deleteInvestment);

module.exports = router;
