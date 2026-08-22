import express from 'express';
import * as authController from '../controllers/Auth.controller.js';

const router = express.Router();

// All auth routes are public (no protect middleware)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

export default router;
