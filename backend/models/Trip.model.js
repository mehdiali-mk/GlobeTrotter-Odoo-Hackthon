import mongoose from 'mongoose';
import slugify from 'slugify';

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

// ─── INDEXES ────────────────────────────────────────────────────────────────────
tripSchema.index({ slug: 1 });
tripSchema.index({ status: 1, isPublic: 1 });

// ─── VIRTUAL PROPERTIES ────────────────────────────────────────────────────────
tripSchema.virtual('durationDays').get(function () {
  if (this.startDate && this.endDate) {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// ─── DOCUMENT MIDDLEWARE ────────────────────────────────────────────────────────

// Generate slug from title before saving
tripSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
});

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Auto-populate creator and members.user on any find query
tripSchema.pre(/^find/, function () {
  this.populate({
    path: 'creator',
    select: 'name photo'
  }).populate({
    path: 'members.user',
    select: 'name photo'
  });
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
