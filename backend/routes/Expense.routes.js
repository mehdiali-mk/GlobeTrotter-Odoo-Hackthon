const express = require('express');
const expenseController = require('../controllers/Expense.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const {
  checkTripMembership
} = require('../middlewares/tripAuth.middleware.js');

// mergeParams: true allows access to :tripId from the parent Trip router
const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(
    checkTripMembership('editor', 'viewer'),
    expenseController.getAllExpenses
  )
  .post(
    checkTripMembership('editor'),
    expenseController.setTripUserIds,
    expenseController.createExpense
  );

router
  .route('/:id')
  .get(
    checkTripMembership('editor', 'viewer'),
    expenseController.getExpense
  )
  .patch(
    checkTripMembership('editor'),
    expenseController.updateExpense
  )
  .delete(
    checkTripMembership('editor'),
    expenseController.deleteExpense
  );

module.exports = router;
