const express = require('express');
const dashboardController = require('../controllers/Dashboard.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

router.get('/', dashboardController.getDashboard);

module.exports = router;
