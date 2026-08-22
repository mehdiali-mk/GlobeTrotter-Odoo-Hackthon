const express = require('express');
const tripController = require('../controllers/Trip.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const {
  checkTripMembership
} = require('../middlewares/tripAuth.middleware.js');

// ─── IMPORT NESTED ROUTERS ─────────────────────────────────────────────────────
const itineraryStopRouter = require('./ItineraryStop.routes.js');
const tripActivityRouter = require('./TripActivity.routes.js');
const expenseRouter = require('./Expense.routes.js');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// ─── NESTED ROUTES ──────────────────────────────────────────────────────────────
// Re-route into nested resource routers
// e.g., POST /api/v1/trips/:tripId/stops → ItineraryStop.routes.js
router.use('/:tripId/stops', itineraryStopRouter);
router.use('/:tripId/activities', tripActivityRouter);
router.use('/:tripId/expenses', expenseRouter);

// ─── PUBLIC SHARING ─────────────────────────────────────────────────────────────
// These only require auth, not trip membership
router.get('/public/:slug', tripController.getPublicTrip);
router.post('/public/:slug/clone', tripController.cloneTrip);

// ─── FILTER BY STATUS ───────────────────────────────────────────────────────────
router.get('/status/:status', tripController.getMyTripsByStatus);

// ─── ITINERARY VIEW (HEAVILY POPULATED) ─────────────────────────────────────────
router.get(
  '/:tripId/itinerary',
  checkTripMembership('editor', 'viewer'),
  tripController.getItineraryView
);

// ─── STANDARD CRUD ──────────────────────────────────────────────────────────────
router
  .route('/')
  .get(tripController.getAllTrips)
  .post(tripController.createTrip);

router
  .route('/:id')
  .get(tripController.getTrip)
  .patch(tripController.updateTrip)
  .delete(tripController.deleteTrip);

module.exports = router;
