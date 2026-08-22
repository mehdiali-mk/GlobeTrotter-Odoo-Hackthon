import mongoose from 'mongoose';
import slugify from 'slugify';

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City must have a name'],
      unique: true,
      trim: true
    },
    slug: String,
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
      min: [1, 'Popularity must be at least 1'],
      max: [5, 'Popularity must be at most 5']
    },
    isTopAttraction: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── INDEXES ────────────────────────────────────────────────────────────────────
citySchema.index({ popularity: -1 });
citySchema.index({ costIndex: 1 });
citySchema.index({ region: 1 });

// ─── DOCUMENT MIDDLEWARE ────────────────────────────────────────────────────────

// Generate slug from name before saving
citySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const City = mongoose.model('City', citySchema);

export default City;
