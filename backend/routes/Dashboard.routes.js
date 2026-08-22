import express from 'express';
import * as dashboardController from '../controllers/Dashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

router.get('/', dashboardController.getDashboard);

export default router;
