import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── HELPERS ────────────────────────────────────────────────────────────────────

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// ─── SIGNUP ─────────────────────────────────────────────────────────────────────

export const signup = catchAsync(async (req, res, next) => {
  // Only allow specific fields to prevent role escalation
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    city: req.body.city,
    country: req.body.country,
    bio: req.body.bio,
    photo: req.body.photo
  });

  createSendToken(newUser, 201, res);
});

// ─── LOGIN ──────────────────────────────────────────────────────────────────────

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist in the request body
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is OK, send token to client
  createSendToken(user, 200, res);
});

// ─── FORGOT PASSWORD ────────────────────────────────────────────────────────────

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with that email address.', 404)
    );
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

  try {
    // TODO: Integrate a real email service (e.g., nodemailer / SendGrid)
    // For development, the token is returned in the response.
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      resetURL // Remove this line in production
    });
  } catch (err) {
    // Rollback: clear the token fields if sending fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

// ─── RESET PASSWORD ─────────────────────────────────────────────────────────────

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in — send JWT
  createSendToken(user, 200, res);
});
