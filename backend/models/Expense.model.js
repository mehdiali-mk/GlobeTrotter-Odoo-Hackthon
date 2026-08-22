import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── STATIC METHODS ─────────────────────────────────────────────────────────────

// Aggregation pipeline to calculate total expenses for a trip
expenseSchema.statics.calcTotalTripExpenses = async function (tripId) {
  const stats = await this.aggregate([
    {
      $match: { trip: tripId }
    },
    {
      $group: {
        _id: '$trip',
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Trip').findByIdAndUpdate(tripId, {
      totalBudget: stats[0].totalAmount
    });
  } else {
    await mongoose.model('Trip').findByIdAndUpdate(tripId, {
      totalBudget: 0
    });
  }
};

// ─── DOCUMENT MIDDLEWARE ────────────────────────────────────────────────────────

// Recalculate trip expenses after saving a new expense
expenseSchema.post('save', function () {
  // 'this' points to current document; 'this.constructor' points to the Model
  this.constructor.calcTotalTripExpenses(this.trip);
});

// ─── QUERY MIDDLEWARE ───────────────────────────────────────────────────────────

// Store the document before findOneAndUpdate / findOneAndDelete for post-hook access
expenseSchema.pre(/^findOneAnd/, async function () {
  // Execute the query to get the document being updated/deleted
  this.doc = await this.model.findOne(this.getQuery());
});

// Recalculate trip expenses after an update or delete via findOneAnd*
expenseSchema.post(/^findOneAnd/, async function () {
  // 'this.doc' was set in the pre middleware above
  if (this.doc) {
    await this.doc.constructor.calcTotalTripExpenses(this.doc.trip);
  }
});

// Auto-populate paidBy and splitAmong on any find query
expenseSchema.pre(/^find/, function () {
  this.populate({
    path: 'paidBy',
    select: 'name photo'
  }).populate({
    path: 'splitAmong',
    select: 'name photo'
  });
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
