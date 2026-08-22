const express = require('express');
const tripActivityController = require('../controllers/TripActivity.controller.js');
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
    tripActivityController.getAllActivities
  )
  .post(
    checkTripMembership('editor'),
    tripActivityController.setTripId,
    tripActivityController.createActivity
  );

router
  .route('/:id')
  .get(
    checkTripMembership('editor', 'viewer'),
    tripActivityController.getActivity
  )
  .patch(
    checkTripMembership('editor'),
    tripActivityController.updateActivity
  )
  .delete(
    checkTripMembership('editor'),
    tripActivityController.deleteActivity
  );

module.exports = router;
