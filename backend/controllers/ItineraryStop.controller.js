import ItineraryStop from '../models/ItineraryStop.model.js';
import APIFeatures from '../utils/apiFeature.util.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── NESTED ROUTE HELPER ────────────────────────────────────────────────────────
// If tripId is in URL params (from nested route) but not in body, set it.

export const setTripId = (req, res, next) => {
  if (!req.body.trip) req.body.trip = req.params.tripId;
  next();
};

// ─── CREATE STOP ────────────────────────────────────────────────────────────────

export const createStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { stop }
  });
});

// ─── GET ALL STOPS ──────────────────────────────────────────────────────────────

export const getAllStops = catchAsync(async (req, res, next) => {
  // Scoped to the trip via nested route param
  const baseFilter = {};
  if (req.params.tripId) baseFilter.trip = req.params.tripId;

  const features = new APIFeatures(ItineraryStop.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const stops = await features.query;

  res.status(200).json({
    status: 'success',
    results: stops.length,
    data: { stops }
  });
});

// ─── GET SINGLE STOP ────────────────────────────────────────────────────────────

export const getStop = catchAsync(async (req, res, next) => {
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

export const updateStop = catchAsync(async (req, res, next) => {
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

export const deleteStop = catchAsync(async (req, res, next) => {
  const stop = await ItineraryStop.findByIdAndDelete(req.params.id);

  if (!stop) {
    return next(new AppError('No itinerary stop found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
