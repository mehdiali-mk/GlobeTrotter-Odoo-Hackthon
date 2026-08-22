import ActivityCatalog from '../models/ActivityCatalog.model.js';
import APIFeatures from '../utils/apiFeature.util.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── SEARCH ACTIVITIES (PUBLIC) ─────────────────────────────────────────────────
// Supports filters: category, cost (range), duration, city, cityName, title

export const searchActivities = catchAsync(async (req, res, next) => {
  const baseFilter = {};

  if (req.query.category) {
    baseFilter.category = req.query.category;
  }
  if (req.query.city) {
    baseFilter.city = req.query.city;
  }
  if (req.query.cityName) {
    baseFilter.cityName = new RegExp(req.query.cityName, 'i');
  }
  if (req.query.title) {
    baseFilter.title = new RegExp(req.query.title, 'i');
  }
  if (req.query.duration) {
    baseFilter.duration = req.query.duration;
  }

  // Cost range filters: ?cost[gte]=100&cost[lte]=500
  if (req.query.cost) {
    if (typeof req.query.cost === 'object') {
      baseFilter.cost = {};
      if (req.query.cost.gte) baseFilter.cost.$gte = Number(req.query.cost.gte);
      if (req.query.cost.lte) baseFilter.cost.$lte = Number(req.query.cost.lte);
    } else {
      baseFilter.cost = Number(req.query.cost);
    }
  }

  const features = new APIFeatures(ActivityCatalog.find(baseFilter), req.query)
    .sort()
    .limitFields()
    .pagination();

  const activities = await features.query;

  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: { activities }
  });
});

// ─── GET SINGLE ACTIVITY ────────────────────────────────────────────────────────

export const getActivity = catchAsync(async (req, res, next) => {
  const activity = await ActivityCatalog.findById(req.params.id);

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

// ─── ADMIN: CREATE ACTIVITY ─────────────────────────────────────────────────────

export const createActivity = catchAsync(async (req, res, next) => {
  const activity = await ActivityCatalog.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { activity }
  });
});

// ─── ADMIN: UPDATE ACTIVITY ─────────────────────────────────────────────────────

export const updateActivity = catchAsync(async (req, res, next) => {
  const activity = await ActivityCatalog.findByIdAndUpdate(
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

// ─── ADMIN: DELETE ACTIVITY ─────────────────────────────────────────────────────

export const deleteActivity = catchAsync(async (req, res, next) => {
  const activity = await ActivityCatalog.findByIdAndDelete(req.params.id);

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
