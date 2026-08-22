const express = require('express');
const authController = require('../controllers/Auth.controller.js');

const router = express.Router();

// All auth routes are public (no protect middleware)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
