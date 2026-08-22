const express = require('express');
const userController = require('../controllers/User.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

module.exports = router;
