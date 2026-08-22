import Card, { CardHeader, CardBody } from "./ui/Card";
import Badge from "./ui/Badge";
import { formatDate, formatMoney, formatHours } from "../utils/format";

// One expense row inside a day, with the arrow that links it to the next one.
export function ActivityExpense({ activity, isLast }) {
  return (
    <li>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-md border border-border p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{activity.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {activity.startTime} · {activity.category} · {formatHours(activity.durationHours)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold">{formatMoney(activity.cost)}</p>
          {activity.isCompleted ? <Badge tone="success">Done</Badge> : null}
        </div>
      </div>
      {!isLast ? (
        <div className="flex justify-center py-1 text-subtle-foreground" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 4v16m0 0-5-5m5 5 5-5" strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
    </li>
  );
}

// A single day of the itinerary with its physical activities and expenses.
export default function ItineraryDay({ dayNumber, date, activities }) {
  const total = activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0);

  return (
    <Card as="section">
      <CardHeader
        title={`Day ${dayNumber}`}
        description={formatDate(date)}
        action={<Badge tone="primary">{formatMoney(total)}</Badge>}
      />
      <CardBody>
        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <p className="eyebrow">Physical activity</p>
          <p className="eyebrow">Expense</p>
        </div>
        <ul>
          {activities.map((activity, index) => (
            <ActivityExpense
              key={activity._id}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
