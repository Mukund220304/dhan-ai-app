const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { processChat, getChatHistory, clearChatHistory } = require('../controllers/chatController');

router.post('/', protect, processChat);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

module.exports = router;
