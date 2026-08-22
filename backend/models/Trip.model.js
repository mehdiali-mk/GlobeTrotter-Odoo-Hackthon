const mongoose = require('mongoose');
const slugify = require('slugify');

const tripSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A trip must have a creator']
    },
    title: {
      type: String,
      required: [true, 'A trip must have a title'],
      trim: true
    },
    slug: String,
    description: {
      type: String
    },
    coverPhoto: {
      type: String,
      default: 'default-trip.jpg'
    },
    startDate: {
      type: Date,
      required: [true, 'A trip must have a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'A trip must have an end date']
    },
    status: {
      type: String,
      enum: ['unplanned', 'upcoming', 'ongoing', 'completed'],
      default: 'upcoming'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    totalBudget: {
      type: Number,
      default: 0
    },
    maxMembers: {
      type: Number,
      required: [true, 'A trip must have a maximum member capacity']
    },
    joinCode: {
      type: String,
      required: [true, 'A trip must have a join code']
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        role: {
          type: String,
          enum: ['editor', 'viewer'],
          default: 'viewer'
        },
        status: {
          type: String,
          enum: ['pending', 'accepted'],
          default: 'pending'
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Middleware to generate slug from title
tripSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
