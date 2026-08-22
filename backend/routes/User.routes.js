import express from 'express';
import * as userController from '../controllers/User.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

export default router;
