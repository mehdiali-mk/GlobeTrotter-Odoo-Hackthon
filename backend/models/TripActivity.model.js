import mongoose from 'mongoose';

const tripActivitySchema = new mongoose.Schema(
  {
    stop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryStop',
      required: [true, 'Activity must belong to an itinerary stop']
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Activity must belong to a trip']
    },
    catalogActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActivityCatalog'
    },
    title: {
      type: String,
      required: [true, 'Activity must have a title']
    },
    category: {
      type: String,
      enum: ['Sightseeing', 'Food', 'Transport', 'Adventure', 'Stay', 'Other'],
      required: [true, 'Activity must have a category']
    },
    cost: {
      type: Number,
      default: 0
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Activity must have a scheduled date']
    },
    dayNumber: {
      type: Number,
      required: [true, 'Activity must have a day number']
    },
    startTime: {
      type: String // e.g., '10:00 AM'
    },
    durationHours: {
      type: Number,
      default: 1
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Auto-populate catalogActivity (if it exists) and addedBy on any find query
tripActivitySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'catalogActivity'
  }).populate({
    path: 'addedBy',
    select: 'name'
  });
  next();
});

const TripActivity = mongoose.model('TripActivity', tripActivitySchema);

export default TripActivity;
