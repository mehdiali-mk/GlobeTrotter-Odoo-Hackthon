const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'City must have a name'],
    unique: true
  },
  country: {
    type: String,
    required: [true, 'City must belong to a country']
  },
  region: {
    type: String,
    required: [true, 'City must have a region']
  },
  image: {
    type: String,
    required: [true, 'City must have an image']
  },
  description: {
    type: String,
    required: [true, 'City must have a description']
  },
  costIndex: {
    type: String,
    enum: ['$', '$$', '$$$'],
    default: '$$'
  },
  popularity: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  isTopAttraction: {
    type: Boolean,
    default: false
  }
});

const City = mongoose.model('City', citySchema);

module.exports = City;
