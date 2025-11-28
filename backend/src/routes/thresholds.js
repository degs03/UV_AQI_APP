const express = require('express');
const router = express.Router();
const thresholdController = require('../controllers/thresholdController');
const { authenticate, isAdmin } = require('../middleware/auth');

// User thresholds
router.get('/user', authenticate, thresholdController.getUserThresholds);
router.post('/user', authenticate, thresholdController.setUserThreshold);
router.delete('/user/:id', authenticate, thresholdController.deleteUserThreshold);

// Global thresholds
router.get('/global', thresholdController.getGlobalThresholds);
router.post('/global', authenticate, isAdmin, thresholdController.setGlobalThreshold);
router.delete('/global/:id', authenticate, isAdmin, thresholdController.deleteGlobalThreshold);

module.exports = router;
