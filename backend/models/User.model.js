import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Traveler full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // NOTE: This only works on CREATE and SAVE
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match'
      }
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
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

// ─── DOCUMENT MIDDLEWARE ────────────────────────────────────────────────────────

// Hash password on save
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field (not persisted to DB)
  this.passwordConfirm = undefined;
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Subtract 1 second to ensure the token is always created after the password change
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Filter out inactive users on any find query
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// ─── INSTANCE METHODS ───────────────────────────────────────────────────────────

// Compare candidate password with stored hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if user changed password after a given JWT timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // FALSE means password was NOT changed after the token was issued
  return false;
};

// Generate a random reset token, hash it, store it, and return the plain token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
