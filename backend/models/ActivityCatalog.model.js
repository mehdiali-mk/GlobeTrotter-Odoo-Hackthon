import mongoose from 'mongoose';
import slugify from 'slugify';

const activityCatalogSchema = new mongoose.Schema(
  {
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
      required: [true, 'Activity must have a title'],
      trim: true
    },
    slug: String,
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
      default: 4.5,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── INDEXES ────────────────────────────────────────────────────────────────────
activityCatalogSchema.index({ category: 1 });
activityCatalogSchema.index({ rating: -1 });

// ─── DOCUMENT MIDDLEWARE ────────────────────────────────────────────────────────

// Generate slug from title before saving
activityCatalogSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
});

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Auto-populate city reference on any find query
activityCatalogSchema.pre(/^find/, function () {
  this.populate({
    path: 'city',
    select: 'name image region'
  });
});

const ActivityCatalog = mongoose.model(
  'ActivityCatalog',
  activityCatalogSchema
);

export default ActivityCatalog;
