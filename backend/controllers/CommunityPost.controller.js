const CommunityPost = require('../models/CommunityPost.model.js');
const AppError = require('../utils/appError.util.js');
const catchAsync = require('../utils/catchAsync.util.js');

// ─── CREATE POST ────────────────────────────────────────────────────────────────

exports.createPost = catchAsync(async (req, res, next) => {
  // Set the user from the authenticated request
  req.body.user = req.user.id;

  const post = await CommunityPost.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { post }
  });
});

// ─── GET ALL POSTS ──────────────────────────────────────────────────────────────

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await CommunityPost.find().sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts }
  });
});

// ─── GET SINGLE POST ────────────────────────────────────────────────────────────

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return next(new AppError('No community post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { post }
  });
});

// ─── UPDATE POST ────────────────────────────────────────────────────────────────
// Only the original author can update their post.

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return next(new AppError('No community post found with that ID', 404));
  }

  // Ownership check: author's _id may be populated or a raw ObjectId
  const postUserId = post.user._id
    ? post.user._id.toString()
    : post.user.toString();

  if (postUserId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own posts', 403));
  }

  const updatedPost = await CommunityPost.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { post: updatedPost }
  });
});

// ─── DELETE POST ────────────────────────────────────────────────────────────────
// Only the original author or an admin can delete a post.

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await CommunityPost.findById(req.params.id);

  if (!post) {
    return next(new AppError('No community post found with that ID', 404));
  }

  const postUserId = post.user._id
    ? post.user._id.toString()
    : post.user.toString();

  if (postUserId !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own posts', 403));
  }

  await CommunityPost.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
