const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSettings, updateProfile, changePassword,
  updateCurrency, updateNotifications, exportCSV, CURRENCIES
} = require('../controllers/settingsController');

router.get('/', protect, getSettings);
router.get('/currencies', (req, res) => res.json(CURRENCIES));
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);
router.patch('/currency', protect, updateCurrency);
router.patch('/notifications', protect, updateNotifications);
router.get('/export-csv', protect, exportCSV);

module.exports = router;
