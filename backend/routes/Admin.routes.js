import express from 'express';
import * as adminController from '../controllers/Admin.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect, restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
