import TripActivity from '../models/TripActivity.model.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── NESTED ROUTE HELPER ────────────────────────────────────────────────────────

export const setTripId = (req, res, next) => {
  if (!req.body.trip) req.body.trip = req.params.tripId;
  next();
};

// ─── CREATE ACTIVITY ────────────────────────────────────────────────────────────

export const createActivity = catchAsync(async (req, res, next) => {
  // Automatically set who added this activity
  req.body.addedBy = req.user.id;

  const activity = await TripActivity.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { activity }
  });
});

// ─── GET ALL ACTIVITIES ─────────────────────────────────────────────────────────

export const getAllActivities = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.params.tripId) filter.trip = req.params.tripId;

  const activities = await TripActivity.find(filter).sort(
    'dayNumber startTime'
  );

  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: { activities }
  });
});

// ─── GET SINGLE ACTIVITY ────────────────────────────────────────────────────────

export const getActivity = catchAsync(async (req, res, next) => {
  const activity = await TripActivity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

// ─── UPDATE ACTIVITY ────────────────────────────────────────────────────────────

export const updateActivity = catchAsync(async (req, res, next) => {
  const activity = await TripActivity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

// ─── DELETE ACTIVITY ────────────────────────────────────────────────────────────

export const deleteActivity = catchAsync(async (req, res, next) => {
  const activity = await TripActivity.findByIdAndDelete(req.params.id);

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
