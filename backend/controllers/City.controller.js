const City = require('../models/City.model.js');
const AppError = require('../utils/appError.util.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ─── SEARCH CITIES (PUBLIC) ─────────────────────────────────────────────────────
// Supports filters: country, costIndex, popularity, region, name, isTopAttraction

exports.searchCities = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.country) {
    filter.country = new RegExp(req.query.country, 'i');
  }
  if (req.query.costIndex) {
    filter.costIndex = req.query.costIndex;
  }
  if (req.query.region) {
    filter.region = new RegExp(req.query.region, 'i');
  }
  if (req.query.name) {
    filter.name = new RegExp(req.query.name, 'i');
  }
  if (req.query.isTopAttraction) {
    filter.isTopAttraction = req.query.isTopAttraction === 'true';
  }

  // Popularity range filters: ?popularity[gte]=4&popularity[lte]=5
  if (req.query.popularity) {
    if (typeof req.query.popularity === 'object') {
      filter.popularity = {};
      if (req.query.popularity.gte)
        filter.popularity.$gte = Number(req.query.popularity.gte);
      if (req.query.popularity.lte)
        filter.popularity.$lte = Number(req.query.popularity.lte);
    } else {
      filter.popularity = Number(req.query.popularity);
    }
  }

  const sortBy = req.query.sort || '-popularity';

  const cities = await City.find(filter).sort(sortBy);

  res.status(200).json({
    status: 'success',
    results: cities.length,
    data: { cities }
  });
});

// ─── GET SINGLE CITY ────────────────────────────────────────────────────────────

exports.getCity = catchAsync(async (req, res, next) => {
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

exports.createCity = catchAsync(async (req, res, next) => {
  const city = await City.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { city }
  });
});

// ─── ADMIN: UPDATE CITY ─────────────────────────────────────────────────────────

exports.updateCity = catchAsync(async (req, res, next) => {
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

exports.deleteCity = catchAsync(async (req, res, next) => {
  const city = await City.findByIdAndDelete(req.params.id);

  if (!city) {
    return next(new AppError('No city found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
