const express = require('express');
const itineraryStopController = require('../controllers/ItineraryStop.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const {
  checkTripMembership
} = require('../middlewares/tripAuth.middleware.js');

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

module.exports = router;
