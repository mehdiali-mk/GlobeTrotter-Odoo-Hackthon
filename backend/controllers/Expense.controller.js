import Expense from '../models/Expense.model.js';
import APIFeatures from '../utils/apiFeature.util.js';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';

// ─── NESTED ROUTE HELPER ────────────────────────────────────────────────────────
// Sets trip and paidBy from the nested route param and authenticated user.

export const setTripUserIds = (req, res, next) => {
  if (!req.body.trip) req.body.trip = req.params.tripId;
  if (!req.body.paidBy) req.body.paidBy = req.user.id;
  next();
};

// ─── CREATE EXPENSE ─────────────────────────────────────────────────────────────
// NOTE: The Expense model's post('save') hook automatically calls
// calcTotalTripExpenses to update the Trip's totalBudget.

export const createExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { expense }
  });
});

// ─── GET ALL EXPENSES ───────────────────────────────────────────────────────────

export const getAllExpenses = catchAsync(async (req, res, next) => {
  const baseFilter = {};
  if (req.params.tripId) baseFilter.trip = req.params.tripId;

  const features = new APIFeatures(Expense.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const expenses = await features.query;

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: { expenses }
  });
});

// ─── GET SINGLE EXPENSE ─────────────────────────────────────────────────────────

export const getExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return next(new AppError('No expense found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { expense }
  });
});

// ─── UPDATE EXPENSE ─────────────────────────────────────────────────────────────
// NOTE: The Expense model's post('findOneAnd') hook automatically
// recalculates the Trip's totalBudget.

export const updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!expense) {
    return next(new AppError('No expense found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { expense }
  });
});

// ─── DELETE EXPENSE ─────────────────────────────────────────────────────────────
// NOTE: The Expense model's post('findOneAnd') hook automatically
// recalculates the Trip's totalBudget.

export const deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);

  if (!expense) {
    return next(new AppError('No expense found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
