import Trip from '../models/Trip.model.js';
import City from '../models/City.model.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── DASHBOARD ──────────────────────────────────────────────────────────────────
// Aggregates the logged-in user's recent trips and fetches top-rated
// city recommendations for the dashboard homepage.

export const getDashboard = catchAsync(async (req, res, next) => {
  // 1) Fetch the user's recent trips (as creator OR member)
  const recentTrips = await Trip.find({
    $or: [
      { creator: req.user.id },
      { 'members.user': req.user.id }
    ]
  })
    .sort('-createdAt')
    .limit(5);

  // 2) Aggregate trip counts by status for the user
  const tripStats = await Trip.aggregate([
    {
      $match: {
        $or: [
          { creator: req.user._id },
          { 'members.user': req.user._id }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // 3) Top-rated city recommendations
  const topCities = await City.find()
    .sort('-popularity')
    .limit(6);

  res.status(200).json({
    status: 'success',
    data: {
      recentTrips,
      tripStats,
      topCities
    }
  });
});
