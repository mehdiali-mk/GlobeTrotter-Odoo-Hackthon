import express from 'express';
import * as itineraryStopController from '../controllers/ItineraryStop.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkTripMembership } from '../middlewares/tripAuth.middleware.js';

// mergeParams: true allows access to :tripId from the parent Trip router
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(
    checkTripMembership('editor', 'viewer'),
    itineraryStopController.getAllStops
  )
  .post(
    checkTripMembership('editor'),
    itineraryStopController.setTripId,
    itineraryStopController.createStop
  );

router
  .route('/:id')
  .get(
    checkTripMembership('editor', 'viewer'),
    itineraryStopController.getStop
  )
  .patch(
    checkTripMembership('editor'),
    itineraryStopController.updateStop
  )
  .delete(
    checkTripMembership('editor'),
    itineraryStopController.deleteStop
  );

export default router;
