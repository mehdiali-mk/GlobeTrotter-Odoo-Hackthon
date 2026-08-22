// Trip level calculations shared by several screens.
import { parseTimeToMinutes } from "./format";

export const tripStatuses = ["upcoming", "ongoing", "completed"];

export function sumExpenses(expenseList) {
  return expenseList.reduce((total, expense) => total + expense.amount, 0);
}

export function sumActivityCost(activityList) {
  return activityList.reduce((total, activity) => total + activity.cost, 0);
}

// Remaining budget can be negative, which the UI shows as over budget.
export function getBudgetSummary(trip, expenseList, activityList) {
  const spent = sumExpenses(expenseList);
  const plannedActivities = sumActivityCost(activityList);
  const remaining = trip.totalBudget - spent;
  const usedPercent = trip.totalBudget > 0 ? Math.round((spent / trip.totalBudget) * 100) : 0;

  return { spent, plannedActivities, remaining, usedPercent };
}

export function groupExpensesByCategory(expenseList) {
  const totals = {};
  expenseList.forEach((expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return Object.keys(totals).map((category) => ({ category, amount: totals[category] }));
}

export function groupActivitiesByDate(activityList) {
  const groups = {};
  activityList.forEach((activity) => {
    if (!groups[activity.scheduledDate]) groups[activity.scheduledDate] = [];
    groups[activity.scheduledDate].push(activity);
  });

  return Object.keys(groups)
    .sort()
    .map((date) => ({
      date,
      activities: groups[date].sort(
        (first, second) =>
          parseTimeToMinutes(first.startTime) - parseTimeToMinutes(second.startTime),
      ),
    }));
}

export function getNextUpcomingTrip(tripList) {
  const upcoming = tripList
    .filter((trip) => trip.status === "upcoming" || trip.status === "ongoing")
    .sort((first, second) => new Date(first.startDate) - new Date(second.startDate));
  return upcoming[0] || null;
}
