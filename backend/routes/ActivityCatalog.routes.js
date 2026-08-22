import express from 'express';
import * as activityCatalogController from '../controllers/ActivityCatalog.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────────
router.get('/', activityCatalogController.searchActivities);
router.get('/:id', activityCatalogController.getActivity);

// ─── ADMIN-ONLY ROUTES ─────────────────────────────────────────────────────────
// All routes below this middleware require admin authentication
router.use(protect, restrictTo('admin'));

router.post('/', activityCatalogController.createActivity);
router.patch('/:id', activityCatalogController.updateActivity);
router.delete('/:id', activityCatalogController.deleteActivity);

export default router;
