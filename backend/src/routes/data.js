const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticate } = require('../middleware/auth');

// Public endpoint for current data (can be accessed by anonymous users)
router.get('/current', dataController.getCurrentData);
router.get('/map', dataController.getMapData);

// Protected routes
router.get('/history', authenticate, dataController.getHistory);
router.get('/history/:sensorId', authenticate, dataController.getHistoryBySensor);
router.get('/statistics', authenticate, dataController.getStatistics);

module.exports = router;
