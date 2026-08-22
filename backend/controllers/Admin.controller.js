const Trip = require('../models/Trip.model.js');
const User = require('../models/User.model.js');
const ItineraryStop = require('../models/ItineraryStop.model.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ─── ANALYTICS ──────────────────────────────────────────────────────────────────
// Admin-only endpoint that aggregates platform-wide statistics.

exports.getAnalytics = catchAsync(async (req, res, next) => {
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
