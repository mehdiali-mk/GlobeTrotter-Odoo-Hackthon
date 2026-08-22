import express from 'express';
import * as expenseController from '../controllers/Expense.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { checkTripMembership } from '../middlewares/tripAuth.middleware.js';

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

export default router;
