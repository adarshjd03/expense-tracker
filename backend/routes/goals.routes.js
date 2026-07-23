const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const goalsController = require('../controllers/goals.controller');

router.use(verifyToken);

router.get('/', goalsController.getGoals);
router.post('/', goalsController.createGoal);
router.put('/:id', goalsController.updateGoal);
router.delete('/:id', goalsController.deleteGoal);
router.post('/:id/contribute', goalsController.contributeToGoal);

module.exports = router;
