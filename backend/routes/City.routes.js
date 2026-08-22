const express = require('express');
const cityController = require('../controllers/City.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

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

module.exports = router;
