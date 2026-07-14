const express = require('express');
const { getTenders, getTenderById, triggerCrawl } = require('../controllers/tenderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getTenders);
router.get('/:id', getTenderById);
router.post('/trigger-crawl', protect, adminOnly, triggerCrawl);

module.exports = router;
