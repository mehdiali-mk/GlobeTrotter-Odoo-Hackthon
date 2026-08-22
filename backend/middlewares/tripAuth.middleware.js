const Trip = require('../models/Trip.model.js');
const AppError = require('../utils/appError.util.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ─── CHECK TRIP MEMBERSHIP ──────────────────────────────────────────────────────
// Custom middleware that finds a Trip by req.params.tripId, checks if
// req.user.id is the creator OR a member with an accepted status and one of
// the specified roles, before allowing the request to proceed.
//
// Usage:
//   checkTripMembership('editor')         → only creators and editors
//   checkTripMembership('editor','viewer') → creators, editors, and viewers

exports.checkTripMembership = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return next(new AppError('No trip found with that ID', 404));
    }

    const userId = req.user.id;

    // The creator always has full access regardless of role
    const creatorId = trip.creator._id
      ? trip.creator._id.toString()
      : trip.creator.toString();

    if (creatorId === userId) {
      req.trip = trip;
      return next();
    }

    // Check if the user exists in the members array
    const member = trip.members.find((m) => {
      const memberId = m.user._id
        ? m.user._id.toString()
        : m.user.toString();
      return memberId === userId;
    });

    if (!member) {
      return next(
        new AppError('You are not a member of this trip', 403)
      );
    }

    if (member.status !== 'accepted') {
      return next(
        new AppError(
          'Your trip membership is still pending approval',
          403
        )
      );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
      return next(
        new AppError(
          `You need one of these roles to perform this action: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    req.trip = trip;
    next();
  });
};
