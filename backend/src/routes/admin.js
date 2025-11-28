const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All routes require admin privileges
router.use(authenticate, isAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Logs
router.get('/logs', adminController.getLogs);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
