const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  
    name: {
    type: String,
    required: [true, 'Traveler full name is required']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false
  },
  phone: {
    type: String
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  bio: {
    type: String
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  savedDestinations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const User = mongoose.model('User', userSchema);

module.exports = User;
