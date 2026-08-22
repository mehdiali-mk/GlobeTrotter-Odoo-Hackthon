const crypto = require('crypto');
const Trip = require('../models/Trip.model.js');
const ItineraryStop = require('../models/ItineraryStop.model.js');
const TripActivity = require('../models/TripActivity.model.js');
const Expense = require('../models/Expense.model.js');
const AppError = require('../utils/appError.util.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

exports.createTrip = catchAsync(async (req, res, next) => {
  // Assign the logged-in user as the trip creator
  req.body.creator = req.user.id;

  // Auto-generate a unique join code if not provided
  if (!req.body.joinCode) {
    req.body.joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  const trip = await Trip.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { trip }
  });
});

exports.getAllTrips = catchAsync(async (req, res, next) => {
  // Build filter — only return trips the user is part of
  const filter = {
    $or: [
      { creator: req.user.id },
      { 'members.user': req.user.id }
    ]
  };

  // Optional status filter from query string
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const trips = await Trip.find(filter).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

exports.getTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip }
  });
});

exports.updateTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip }
  });
});

exports.deleteTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findByIdAndDelete(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  // Cascade delete all related documents
  await ItineraryStop.deleteMany({ trip: trip._id });
  await TripActivity.deleteMany({ trip: trip._id });
  await Expense.deleteMany({ trip: trip._id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP LISTING BY STATUS (Requirement #4)
// ═══════════════════════════════════════════════════════════════════════════════

exports.getMyTripsByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;

  const validStatuses = ['unplanned', 'upcoming', 'ongoing', 'completed'];
  if (!validStatuses.includes(status)) {
    return next(
      new AppError(
        `Invalid status. Use one of: ${validStatuses.join(', ')}`,
        400
      )
    );
  }

  const trips = await Trip.find({
    status,
    $or: [
      { creator: req.user.id },
      { 'members.user': req.user.id }
    ]
  }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ITINERARY VIEW — Heavily Populated (Requirements #6 & #10)
// ═══════════════════════════════════════════════════════════════════════════════

exports.getItineraryView = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  // Fetch all stops, activities, and expenses in parallel
  const [stops, activities, expenses] = await Promise.all([
    ItineraryStop.find({ trip: trip._id }).sort('stopOrder'),
    TripActivity.find({ trip: trip._id }).sort('dayNumber startTime'),
    Expense.find({ trip: trip._id }).sort('-date')
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      trip,
      stops,
      activities,
      expenses
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC SHARING (Requirement #11)
// ═══════════════════════════════════════════════════════════════════════════════

exports.getPublicTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findOne({
    slug: req.params.slug,
    isPublic: true
  });

  if (!trip) {
    return next(new AppError('No public trip found with that slug', 404));
  }

  const [stops, activities] = await Promise.all([
    ItineraryStop.find({ trip: trip._id }).sort('stopOrder'),
    TripActivity.find({ trip: trip._id }).sort('dayNumber startTime')
  ]);

  res.status(200).json({
    status: 'success',
    data: { trip, stops, activities }
  });
});

exports.cloneTrip = catchAsync(async (req, res, next) => {
  // 1) Find the original public trip
  const originalTrip = await Trip.findOne({
    slug: req.params.slug,
    isPublic: true
  });

  if (!originalTrip) {
    return next(new AppError('No public trip found with that slug', 404));
  }

  // 2) Clone the trip under the current user
  const clonedTrip = await Trip.create({
    creator: req.user.id,
    title: `${originalTrip.title} (Clone)`,
    description: originalTrip.description,
    coverPhoto: originalTrip.coverPhoto,
    startDate: originalTrip.startDate,
    endDate: originalTrip.endDate,
    status: 'unplanned',
    isPublic: false,
    maxMembers: originalTrip.maxMembers,
    joinCode: crypto.randomBytes(4).toString('hex').toUpperCase()
  });

  // 3) Clone all itinerary stops (map old stop IDs → new ones)
  const originalStops = await ItineraryStop.find({
    trip: originalTrip._id
  });
  const stopIdMap = {};

  for (const stop of originalStops) {
    const clonedStop = await ItineraryStop.create({
      trip: clonedTrip._id,
      city: stop.city._id || stop.city,
      cityName: stop.cityName,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      stopOrder: stop.stopOrder,
      accommodation: stop.accommodation,
      notes: stop.notes
    });
    stopIdMap[stop._id.toString()] = clonedStop._id;
  }

  // 4) Clone all trip activities, remapping stop references
  const originalActivities = await TripActivity.find({
    trip: originalTrip._id
  });

  for (const activity of originalActivities) {
    const oldStopId = activity.stop._id
      ? activity.stop._id.toString()
      : activity.stop.toString();

    await TripActivity.create({
      stop: stopIdMap[oldStopId] || activity.stop,
      trip: clonedTrip._id,
      catalogActivity:
        activity.catalogActivity?._id || activity.catalogActivity,
      title: activity.title,
      category: activity.category,
      cost: activity.cost,
      scheduledDate: activity.scheduledDate,
      dayNumber: activity.dayNumber,
      startTime: activity.startTime,
      durationHours: activity.durationHours,
      isCompleted: false,
      addedBy: req.user.id
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Trip cloned successfully',
    data: { trip: clonedTrip }
  });
});
