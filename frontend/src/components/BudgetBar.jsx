import { formatMoney } from "../utils/format";

// Shows how much of a trip budget is used. Values come from real expenses.
export default function BudgetBar({ totalBudget, spent }) {
  const usedPercent = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const clampedPercent = Math.min(100, Math.max(0, usedPercent));
  const isOverBudget = spent > totalBudget;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{formatMoney(spent)} spent</span>
        <span className="text-muted-foreground">of {formatMoney(totalBudget)}</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget used"
      >
        <div
          className={`h-full rounded-full ${isOverBudget ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      <p className={`mt-1.5 text-xs ${isOverBudget ? "text-danger" : "text-muted-foreground"}`}>
        {isOverBudget
          ? `${formatMoney(spent - totalBudget)} over budget`
          : `${formatMoney(totalBudget - spent)} remaining · ${clampedPercent}% used`}
      </p>
    </div>
  );
}
