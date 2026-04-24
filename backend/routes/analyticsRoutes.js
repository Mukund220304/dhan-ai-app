const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSummary, getTrends, getForecast, getGoalStrategy } = require('../controllers/analyticsController');

router.get('/summary', protect, getSummary);
router.get('/trends', protect, getTrends);
router.get('/forecast', protect, getForecast);
router.post('/goal-strategy', protect, getGoalStrategy);

module.exports = router;
