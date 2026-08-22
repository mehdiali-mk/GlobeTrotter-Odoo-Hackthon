import User from '../models/User.model.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── HELPER ─────────────────────────────────────────────────────────────────────
// Filters an object to only include allowed fields (prevents mass-assignment).

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// ─── GET ME ─────────────────────────────────────────────────────────────────────

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// ─── UPDATE ME ──────────────────────────────────────────────────────────────────
// Updates profile details and saved destinations.
// Rejects password updates — those go through the Auth controller.

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Block password updates on this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /api/v1/auth/resetPassword.',
        400
      )
    );
  }

  // 2) Filter out fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'city',
    'country',
    'bio',
    'photo',
    'savedDestinations'
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

// ─── DELETE ME (DEACTIVATE) ─────────────────────────────────────────────────────
// Soft-deletes the account by setting active to false.
// The User model's pre(/^find/) middleware automatically filters these out.

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
