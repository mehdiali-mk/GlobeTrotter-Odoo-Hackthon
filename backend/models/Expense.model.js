const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Expense must belong to a trip']
  },
  title: {
    type: String,
    required: [true, 'Expense must have a title/description']
  },
  amount: {
    type: Number,
    required: [true, 'Expense must have an amount']
  },
  category: {
    type: String,
    enum: ['Transport', 'Stay', 'Activities', 'Meals', 'Miscellaneous'],
    required: [true, 'Expense must have a category']
  },
  date: {
    type: Date,
    default: Date.now
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Expense must have a payer']
  },
  splitAmong: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
