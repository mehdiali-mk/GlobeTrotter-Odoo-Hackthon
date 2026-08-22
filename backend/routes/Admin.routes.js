const express = require('express');
const adminController = require('../controllers/Admin.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect, restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);

module.exports = router;
