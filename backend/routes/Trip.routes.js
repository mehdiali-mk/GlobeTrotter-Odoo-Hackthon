import express from 'express';
import * as tripController from '../controllers/Trip.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkTripMembership } from '../middlewares/tripAuth.middleware.js';

// ─── IMPORT NESTED ROUTERS ─────────────────────────────────────────────────────
import itineraryStopRouter from './ItineraryStop.routes.js';
import tripActivityRouter from './TripActivity.routes.js';
import expenseRouter from './Expense.routes.js';

const router = express.Router();

// ─── PUBLIC SHARING (NO AUTH REQUIRED FOR VIEW) ─────────────────────────
router.get('/public/:slug', tripController.getPublicTrip);

// All other trip routes require authentication
router.use(protect);

// Clone requires authentication
router.post('/public/:slug/clone', tripController.cloneTrip);

// ─── NESTED ROUTES ──────────────────────────────────────────────────────────────
// Re-route into nested resource routers
// e.g., POST /api/v1/trips/:tripId/stops → ItineraryStop.routes.js
router.use('/:tripId/stops', itineraryStopRouter);
router.use('/:tripId/activities', tripActivityRouter);
router.use('/:tripId/expenses', expenseRouter);

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

export default router;
