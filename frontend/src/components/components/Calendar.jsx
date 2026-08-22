import Card, { CardBody } from "./ui/Card";
import Button from "./ui/Button";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

// Builds the visible grid: leading blanks (Monday first) then every day.
function buildDays(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(Date.UTC(year, month, day)));
  return cells;
}

// Reusable month calendar. `events` is data driven:
// [{ id, title, startDate, endDate, tone, onClick }]
export default function Calendar({ year, month, events = [], onPrevious, onNext, onToday }) {
  const cells = buildDays(year, month);
  const todayKey = toKey(new Date());

  function eventsForDay(date) {
    const key = toKey(date);
    return events.filter((event) => {
      const start = String(event.startDate).slice(0, 10);
      const end = String(event.endDate || event.startDate).slice(0, 10);
      return key >= start && key <= end;
    });
  }

  return (
    <Card>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="eyebrow">Calendar view</p>
          <h2 className="truncate text-base font-semibold">
            {monthNames[month]} {year}
          </h2>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={onPrevious}>
            Previous
          </Button>
          {onToday ? (
            <Button variant="ghost" size="sm" onClick={onToday}>
              Today
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>

      <CardBody>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((day) => (
            <p key={day} className="eyebrow py-1">
              {day}
            </p>
          ))}

          {cells.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} className="min-h-20 rounded-md" />;
            const key = toKey(date);
            const dayEvents = eventsForDay(date);
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                className={`min-h-20 rounded-md border p-1.5 text-left ${
                  isToday ? "border-primary bg-primary-soft/40" : "border-border bg-surface"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {date.getUTCDate()}
                </p>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={event.onClick}
                      className="block w-full truncate rounded bg-primary-soft px-1.5 py-0.5 text-left text-[0.65rem] font-semibold tracking-wide text-primary uppercase hover:bg-primary/15"
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 ? (
                    <p className="px-1.5 text-[0.65rem] text-subtle-foreground">
                      +{dayEvents.length - 2} more
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
