import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── PROTECT ────────────────────────────────────────────────────────────────────
// Verifies JWT from Authorization header and attaches the authenticated user
// to req.user for all downstream middleware and controllers.

export const protect = catchAsync(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  // GRANT ACCESS — attach user to request
  req.user = currentUser;
  next();
});

// ─── RESTRICT TO ────────────────────────────────────────────────────────────────
// Role-based authorization. Accepts a list of allowed roles and denies access
// if the authenticated user's role is not included.

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }
    next();
  };
};
