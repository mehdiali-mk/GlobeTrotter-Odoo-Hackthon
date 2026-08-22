import City from '../models/City.model.js';
import APIFeatures from '../utils/apiFeature.util.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── SEARCH CITIES (PUBLIC) ─────────────────────────────────────────────────────
// Supports filters: country, costIndex, popularity, region, name, isTopAttraction

export const searchCities = catchAsync(async (req, res, next) => {
  const baseFilter = {};

  if (req.query.country) {
    baseFilter.country = new RegExp(req.query.country, 'i');
  }
  if (req.query.costIndex) {
    baseFilter.costIndex = req.query.costIndex;
  }
  if (req.query.region) {
    baseFilter.region = new RegExp(req.query.region, 'i');
  }
  if (req.query.name) {
    baseFilter.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.isTopAttraction) {
    baseFilter.isTopAttraction = req.query.isTopAttraction === 'true';
  }

  // Popularity range filters: ?popularity[gte]=4&popularity[lte]=5
  if (req.query.popularity) {
    if (typeof req.query.popularity === 'object') {
      baseFilter.popularity = {};
      if (req.query.popularity.gte)
        baseFilter.popularity.$gte = Number(req.query.popularity.gte);
      if (req.query.popularity.lte)
        baseFilter.popularity.$lte = Number(req.query.popularity.lte);
    } else {
      baseFilter.popularity = Number(req.query.popularity);
    }
  }

  const features = new APIFeatures(City.find(baseFilter), req.query)
    .sort()
    .limitFields()
    .pagination();

  const cities = await features.query;

  res.status(200).json({
    status: 'success',
    results: cities.length,
    data: { cities }
  });
});

// ─── GET SINGLE CITY ────────────────────────────────────────────────────────────

export const getCity = catchAsync(async (req, res, next) => {
  const city = await City.findById(req.params.id);

  if (!city) {
    return next(new AppError('No city found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { city }
  });
});

// ─── ADMIN: CREATE CITY ─────────────────────────────────────────────────────────

export const createCity = catchAsync(async (req, res, next) => {
  const city = await City.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { city }
  });
});

// ─── ADMIN: UPDATE CITY ─────────────────────────────────────────────────────────

export const updateCity = catchAsync(async (req, res, next) => {
  const city = await City.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!city) {
    return next(new AppError('No city found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { city }
  });
});

// ─── ADMIN: DELETE CITY ─────────────────────────────────────────────────────────

export const deleteCity = catchAsync(async (req, res, next) => {
  const city = await City.findByIdAndDelete(req.params.id);

  if (!city) {
    return next(new AppError('No city found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
