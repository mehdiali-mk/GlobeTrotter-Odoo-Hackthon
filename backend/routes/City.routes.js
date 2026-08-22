import express from 'express';
import * as cityController from '../controllers/City.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────────
router.get('/', cityController.searchCities);
router.get('/:id', cityController.getCity);

// ─── ADMIN-ONLY ROUTES ─────────────────────────────────────────────────────────
// All routes below this middleware require admin authentication
router.use(protect, restrictTo('admin'));

router.post('/', cityController.createCity);
router.patch('/:id', cityController.updateCity);
router.delete('/:id', cityController.deleteCity);

export default router;
