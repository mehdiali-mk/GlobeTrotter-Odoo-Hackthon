const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Community post must be linked to a trip']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Community post must have an author']
    },
    caption: {
      type: String,
      required: [true, 'Community post must have a caption']
    },
    likesCount: {
      type: Number,
      default: 0
    },
    clonesCount: {
      type: Number,
      default: 0
    },
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

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Auto-populate user and trip references on any find query
communityPostSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  }).populate({
    path: 'trip',
    select: 'title coverPhoto slug'
  });
  next();
});

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost;
