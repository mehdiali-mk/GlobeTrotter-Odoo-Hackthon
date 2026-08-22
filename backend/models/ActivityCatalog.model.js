const mongoose = require('mongoose');

const activityCatalogSchema = new mongoose.Schema({
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'Activity must reference a host city']
  },
  cityName: {
    type: String,
    required: [true, 'City name is required']
  },
  title: {
    type: String,
    required: [true, 'Activity must have a title']
  },
  category: {
    type: String,
    enum: ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Stay'],
    required: [true, 'Activity must have a category']
  },
  cost: {
    type: Number,
    required: [true, 'Activity must have a cost']
  },
  duration: {
    type: String,
    required: [true, 'Activity must have a duration']
  },
  image: {
    type: String,
    required: [true, 'Activity must have an image']
  },
  description: {
    type: String,
    required: [true, 'Activity must have a description']
  },
  rating: {
    type: Number,
    default: 4.5
  }
});

const ActivityCatalog = mongoose.model('ActivityCatalog', activityCatalogSchema);

module.exports = ActivityCatalog;
