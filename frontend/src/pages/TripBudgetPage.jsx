import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { TextField, SelectField } from "../components/ui/Field";
import { NotFoundState, EmptyState } from "../components/ui/States";
import TripTabs from "../components/TripTabs";
import BudgetBar from "../components/BudgetBar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppData } from "../context/AppDataContext";
import { canEditTrip } from "../utils/permissions";
import { useToast } from "../context/ToastContext";
import { getBudgetSummary, groupExpensesByCategory, sumExpenses } from "../utils/trip";
import { formatMoney, formatDate, countDays } from "../utils/format";
import { toDateInputValue } from "../services/tripService";

const expenseCategories = ["Transport", "Stay", "Food", "Activities", "Other"];

export default function TripBudgetPage({ tripId }) {
  const data = useAppData();
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const trip = data.getTripById(tripId);

  if (!trip) {
    return (
      <NotFoundState
        title="Trip not found"
        message="This trip does not exist or is no longer shared with you."
        backTo="/trips"
        backLabel="Back to trips"
      />
    );
  }

  const expenses = data.getExpensesForTrip(tripId);
  const activities = data.getActivitiesForTrip(tripId);
  const summary = getBudgetSummary(trip, expenses, activities);
  const categoryTotals = groupExpensesByCategory(expenses).sort(
    (first, second) => second.amount - first.amount,
  );
  const totalSpent = sumExpenses(expenses);
  const days = countDays(trip.startDate, trip.endDate);
  const perDay = days > 0 ? Math.round(totalSpent / days) : 0;

  function handleAddExpense(values) {
    data.addExpense(tripId, values);
    showToast(`"${values.title}" added to the budget`);
    setIsFormOpen(false);
  }

  function handleDeleteExpense() {
    data.removeExpense(expenseToDelete._id);
    setExpenseToDelete(null);
    showToast("Expense removed", "danger");
  }

  const canEdit = canEditTrip(trip, data.currentUser);

  return (
    <>
      <PageHeader
        eyebrow={trip.title}
        title="Budget"
        description="Recorded expenses against the trip budget, plus the cost of planned activities."
        actions={
          canEdit ? (
            <Button onClick={() => setIsFormOpen((open) => !open)}>
              {isFormOpen ? "Close form" : "Add expense"}
            </Button>
          ) : null
        }
      >
        {!canEdit ? (
          <p className="mt-3 text-sm text-muted-foreground">
            View-only access: you can read this budget but not record expenses.
          </p>
        ) : null}
      </PageHeader>

      <TripTabs tripId={tripId} />

      {isFormOpen && canEdit ? (
        <div className="mb-6">
          <ExpenseForm trip={trip} onAdd={handleAddExpense} onCancel={() => setIsFormOpen(false)} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Budget usage" />
            <CardBody>
              <BudgetBar totalBudget={trip.totalBudget} spent={summary.spent} />
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Planned activities</dt>
                  <dd className="font-medium">{formatMoney(summary.plannedActivities)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Average per day</dt>
                  <dd className="font-medium">{formatMoney(perDay)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Per member</dt>
                  <dd className="font-medium">
                    {formatMoney(Math.round(totalSpent / Math.max(1, trip.members.length)))}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="By category" />
            <CardBody>
              {categoryTotals.length > 0 ? (
                <ul className="space-y-4">
                  {categoryTotals.map((entry) => {
                    const percent =
                      totalSpent > 0 ? Math.round((entry.amount / totalSpent) * 100) : 0;
                    return (
                      <li key={entry.category}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{entry.category}</span>
                          <span className="text-muted-foreground">
                            {formatMoney(entry.amount)} · {percent}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Who paid what"
              description="Useful when the group settles up after the trip."
            />
            <CardBody>
              <ul className="space-y-3 text-sm">
                {trip.members.map((memberId) => {
                  const member = data.getUserById(memberId);
                  const paid = sumExpenses(
                    expenses.filter((expense) => expense.paidBy === memberId),
                  );
                  const owes = expenses.reduce((total, expense) => {
                    if (!expense.splitAmong.includes(memberId)) return total;
                    return total + expense.amount / expense.splitAmong.length;
                  }, 0);
                  const balance = Math.round(paid - owes);

                  return (
                    <li key={memberId} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">
                        {member ? member.name : "Member"}
                        <span className="text-muted-foreground"> · paid {formatMoney(paid)}</span>
                      </span>
                      <span
                        className={`shrink-0 font-medium ${
                          balance < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {balance < 0
                          ? `owes ${formatMoney(Math.abs(balance))}`
                          : `gets ${formatMoney(balance)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Expenses" description={`${expenses.length} recorded`} />
          <CardBody className="px-0 py-0">
            {expenses.length > 0 ? (
              <ul>
                {expenses.map((expense) => {
                  const payer = data.getUserById(expense.paidBy);
                  return (
                    <li
                      key={expense._id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{expense.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {expense.category} · {formatDate(expense.date)}
                          {payer ? ` · paid by ${payer.name}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-subtle-foreground">
                          Split among {expense.splitAmong.length}{" "}
                          {expense.splitAmong.length === 1 ? "member" : "members"}
                        </p>
                        {canEdit ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 -ml-3"
                            onClick={() => setExpenseToDelete(expense)}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium">{formatMoney(expense.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(
                            Math.round(expense.amount / Math.max(1, expense.splitAmong.length)),
                          )}{" "}
                          each
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState
                  title="No expenses yet"
                  message="Record what the group spends to track it against the budget."
                  action={<Button onClick={() => setIsFormOpen(true)}>Add expense</Button>}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(expenseToDelete)}
        title="Remove this expense?"
        message={expenseToDelete ? `"${expenseToDelete.title}" will be removed.` : ""}
        confirmLabel="Remove"
        onConfirm={handleDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />
    </>
  );
}

// Expense form. Values go straight into the shared session dataset.
function ExpenseForm({ trip, onAdd, onCancel }) {
  const data = useAppData();
  const [values, setValues] = useState({
    title: "",
    amount: "",
    category: expenseCategories[0],
    date: toDateInputValue(new Date().toISOString()),
    paidBy: data.currentUser._id,
  });
  const [errors, setErrors] = useState({});

  function updateValue(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (values.title.trim() === "") nextErrors.title = "Give the expense a title.";
    if (!(Number(values.amount) > 0)) nextErrors.amount = "Enter an amount above zero.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onAdd({ ...values, splitAmong: trip.members });
  }

  return (
    <Card>
      <CardHeader title="Add an expense" description="Split evenly between everyone on the trip." />
      <CardBody>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3" noValidate>
          <TextField
            id="expense-title"
            label="Title"
            value={values.title}
            error={errors.title}
            onChange={(event) => updateValue("title", event.target.value)}
          />
          <TextField
            id="expense-amount"
            label="Amount (USD)"
            type="number"
            min="0"
            value={values.amount}
            error={errors.amount}
            onChange={(event) => updateValue("amount", event.target.value)}
          />
          <SelectField
            id="expense-category"
            label="Category"
            value={values.category}
            onChange={(event) => updateValue("category", event.target.value)}
            options={expenseCategories.map((value) => ({ value, label: value }))}
          />
          <TextField
            id="expense-date"
            label="Date"
            type="date"
            value={values.date}
            onChange={(event) => updateValue("date", event.target.value)}
          />
          <SelectField
            id="expense-paid-by"
            label="Paid by"
            value={values.paidBy}
            onChange={(event) => updateValue("paidBy", event.target.value)}
            options={trip.members.map((memberId) => {
              const member = data.getUserById(memberId);
              return { value: memberId, label: member ? member.name : memberId };
            })}
          />
          <div className="flex items-end gap-2">
            <Button type="submit">Add expense</Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
