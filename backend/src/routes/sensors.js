const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public endpoint for receiving sensor data
router.post('/data', sensorController.receiveSensorData);

// Get all sensors (authenticated users)
router.get('/', authenticate, sensorController.getAllSensors);

// Admin only routes
router.post('/', authenticate, isAdmin, sensorController.createSensor);
router.put('/:id', authenticate, isAdmin, sensorController.updateSensor);
router.delete('/:id', authenticate, isAdmin, sensorController.deleteSensor);

module.exports = router;
