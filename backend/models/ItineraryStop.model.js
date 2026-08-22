const mongoose = require('mongoose');

const itineraryStopSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Itinerary stop must belong to a trip']
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'Itinerary stop must reference a city']
    },
    cityName: {
      type: String,
      required: [true, 'City name is required for quick rendering']
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required']
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required']
    },
    stopOrder: {
      type: Number,
      default: 1
    },
    accommodation: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Auto-populate city and trip references on any find query
itineraryStopSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'city',
    select: 'name image'
  }).populate({
    path: 'trip',
    select: 'title'
  });
  next();
});

const ItineraryStop = mongoose.model('ItineraryStop', itineraryStopSchema);

module.exports = ItineraryStop;
