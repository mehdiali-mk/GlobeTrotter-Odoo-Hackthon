import crypto from 'crypto';
import Trip from '../models/Trip.model.js';
import ItineraryStop from '../models/ItineraryStop.model.js';
import TripActivity from '../models/TripActivity.model.js';
import Expense from '../models/Expense.model.js';
import User from '../models/User.model.js';
import APIFeatures from '../utils/apiFeature.util.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const createTrip = catchAsync(async (req, res, next) => {
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

export const getAllTrips = catchAsync(async (req, res, next) => {
  // Build base filter — only return trips the user is part of
  const baseFilter = {
    $or: [
      { creator: req.user.id },
      { 'members.user': req.user.id }
    ]
  };

  // Optional status filter from query string
  if (req.query.status) {
    baseFilter.status = req.query.status;
  }

  const features = new APIFeatures(Trip.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const trips = await features.query;

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

export const getTrip = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { trip }
  });
});

export const updateTrip = catchAsync(async (req, res, next) => {
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

export const deleteTrip = catchAsync(async (req, res, next) => {
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

export const getMyTripsByStatus = catchAsync(async (req, res, next) => {
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

  const baseFilter = {
    status,
    $or: [
      { creator: req.user.id },
      { 'members.user': req.user.id }
    ]
  };

  const features = new APIFeatures(Trip.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const trips = await features.query;

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ITINERARY VIEW — Heavily Populated (Requirements #6 & #10)
// ═══════════════════════════════════════════════════════════════════════════════

export const getItineraryView = catchAsync(async (req, res, next) => {
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

export const getPublicTrips = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Trip.find({ isPublic: true }), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const trips = await features.query;

  res.status(200).json({
    status: 'success',
    results: trips.length,
    data: { trips }
  });
});

export const getPublicTrip = catchAsync(async (req, res, next) => {
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

export const cloneTrip = catchAsync(async (req, res, next) => {
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
    const cityId = stop.populated('city') || stop.city?._id || stop.city;
    const clonedStop = await ItineraryStop.create({
      trip: clonedTrip._id,
      city: cityId,
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
    const oldStopId = (
      activity.populated('stop') ||
      activity.stop?._id ||
      activity.stop
    )?.toString();

    const catalogActId =
      activity.populated('catalogActivity') ||
      activity.catalogActivity?._id ||
      activity.catalogActivity;

    await TripActivity.create({
      stop: stopIdMap[oldStopId] || oldStopId,
      trip: clonedTrip._id,
      catalogActivity: catalogActId || undefined,
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

// ═══════════════════════════════════════════════════════════════════════════════
// TRIP MEMBERSHIPS (Requirement # Gap 1)
// ═══════════════════════════════════════════════════════════════════════════════

export const joinTrip = catchAsync(async (req, res, next) => {
  const { joinCode } = req.body;
  
  const trip = await Trip.findOne({ joinCode: joinCode.toUpperCase() });
  
  if (!trip) {
    return next(new AppError('No trip found with that join code', 404));
  }
  
  if (trip.creator.id === req.user.id || trip.creator === req.user.id) {
    return next(new AppError('You are the creator of this trip', 400));
  }
  
  const existingMember = trip.members.find(
    (m) => m.user.id === req.user.id || m.user.toString() === req.user.id
  );
  
  if (existingMember && existingMember.status === 'accepted') {
    return next(new AppError('You are already a member of this trip', 400));
  }
  
  // Accepted members count (1 for creator + accepted members)
  const acceptedCount = 1 + trip.members.filter(m => m.status === 'accepted').length;
  if (acceptedCount >= trip.maxMembers && (!existingMember || existingMember.status !== 'accepted')) {
    return next(new AppError('This trip is already full', 400));
  }
  
  if (existingMember) {
    existingMember.status = 'accepted';
  } else {
    trip.members.push({
      user: req.user.id,
      role: 'viewer',
      status: 'accepted'
    });
  }
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Successfully joined the trip',
    data: { trip }
  });
});

export const inviteMember = catchAsync(async (req, res, next) => {
  const { email, role } = req.body;
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No GlobeTrotter account uses that email', 404));
  }
  
  if (trip.creator.id === user.id || trip.creator === user.id) {
    return next(new AppError('This user is the creator of the trip', 400));
  }
  
  const existingMember = trip.members.find(
    (m) => m.user.id === user.id || m.user.toString() === user.id
  );
  
  if (existingMember) {
    return next(new AppError('User is already on this trip', 400));
  }
  
  const acceptedCount = 1 + trip.members.filter(m => m.status === 'accepted').length;
  if (acceptedCount >= trip.maxMembers) {
    return next(new AppError('Member capacity reached', 400));
  }
  
  trip.members.push({
    user: user.id,
    role: role || 'viewer',
    status: 'pending'
  });
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: `Invite sent to ${user.name}`
  });
});

export const updateMember = catchAsync(async (req, res, next) => {
  const { role, status } = req.body;
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }
  
  const member = trip.members.find(
    (m) => m.user.id === req.params.userId || m.user.toString() === req.params.userId
  );
  
  if (!member) {
    return next(new AppError('User is not a member of this trip', 404));
  }
  
  if (role) member.role = role;
  if (status) member.status = status;
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    data: { trip }
  });
});

export const removeMember = catchAsync(async (req, res, next) => {
  const trip = await Trip.findById(req.params.tripId);
  
  if (!trip) {
    return next(new AppError('No trip found with that ID', 404));
  }
  
  if (trip.creator.id === req.params.userId || trip.creator === req.params.userId) {
    return next(new AppError('The owner cannot leave their own trip', 400));
  }
  
  trip.members = trip.members.filter(
    (m) => m.user.id !== req.params.userId && m.user.toString() !== req.params.userId
  );
  
  await trip.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Member removed successfully',
    data: { trip }
  });
});

