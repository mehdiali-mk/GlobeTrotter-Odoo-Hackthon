const ItineraryStop = require('../models/ItineraryStop.model.js');
const AppError = require('../utils/appError.util.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ─── NESTED ROUTE HELPER ────────────────────────────────────────────────────────
// If tripId is in URL params (from nested route) but not in body, set it.

exports.setTripId = (req, res, next) => {
  if (!req.body.trip) req.body.trip = req.params.tripId;
  next();
};

// ─── CREATE STOP ────────────────────────────────────────────────────────────────

exports.createStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { stop }
  });
});

// ─── GET ALL STOPS ──────────────────────────────────────────────────────────────

exports.getAllStops = catchAsync(async (req, res, next) => {
  // Scoped to the trip via nested route param
  const filter = {};
  if (req.params.tripId) filter.trip = req.params.tripId;

  const stops = await ItineraryStop.find(filter).sort('stopOrder');

  res.status(200).json({
    status: 'success',
    results: stops.length,
    data: { stops }
  });
});

// ─── GET SINGLE STOP ────────────────────────────────────────────────────────────

exports.getStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.findById(req.params.id);

  if (!stop) {
    return next(new AppError('No itinerary stop found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { stop }
  });
});

// ─── UPDATE STOP ────────────────────────────────────────────────────────────────

exports.updateStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!stop) {
    return next(new AppError('No itinerary stop found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { stop }
  });
});

// ─── DELETE STOP ────────────────────────────────────────────────────────────────

exports.deleteStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.findByIdAndDelete(req.params.id);

  if (!stop) {
    return next(new AppError('No itinerary stop found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
