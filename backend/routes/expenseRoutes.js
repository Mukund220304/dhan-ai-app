const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  uploadExpense,
} = require('../controllers/expenseController');

const upload = multer({ dest: 'uploads/' });

router.get('/', protect, getExpenses);
router.post('/add', protect, addExpense);
router.post('/upload', protect, upload.single('file'), uploadExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
