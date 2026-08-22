import Trip from '../models/Trip.model.js';
import User from '../models/User.model.js';
import ItineraryStop from '../models/ItineraryStop.model.js';
import catchAsync from '../utils/catchAsync.util.js';
import AppError from '../utils/appError.util.js';

// ─── ANALYTICS ──────────────────────────────────────────────────────────────────
// Admin-only endpoint that aggregates platform-wide statistics.

export const getAnalytics = catchAsync(async (req, res, next) => {
  // Run all aggregations in parallel
  const [
    totalTrips,
    activeUsers,
    tripsByStatus,
    popularDestinations,
    budgetStats
  ] = await Promise.all([
    // 1) Total number of trips
    Trip.countDocuments(),

    // 2) Active (non-deactivated) users
    User.countDocuments({ active: { $ne: false } }),

    // 3) Trip breakdown by status
    Trip.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]),

    // 4) Most visited cities (from itinerary stops)
    ItineraryStop.aggregate([
      {
        $group: {
          _id: '$city',
          visitCount: { $sum: 1 },
          cityName: { $first: '$cityName' }
        }
      },
      { $sort: { visitCount: -1 } },
      { $limit: 10 }
    ]),

    // 5) Budget statistics across all trips
    Trip.aggregate([
      {
        $group: {
          _id: null,
          totalBudgetAllTrips: { $sum: '$totalBudget' },
          avgBudget: { $avg: '$totalBudget' }
        }
      }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalTrips,
      activeUsers,
      tripsByStatus,
      popularDestinations,
      budgetStats: budgetStats[0] || {
        totalBudgetAllTrips: 0,
        avgBudget: 0
      }
    }
  });
});

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────────

export const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

