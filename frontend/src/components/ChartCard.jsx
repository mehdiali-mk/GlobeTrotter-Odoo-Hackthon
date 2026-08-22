import Card, { CardHeader, CardBody } from "./ui/Card";

// Lightweight bar chart built with plain divs, so no chart library is needed.
// `items` is [{ label, value, caption }].
export default function ChartCard({ title, description, items, orientation = "horizontal" }) {
  const max = items.reduce((highest, item) => Math.max(highest, Number(item.value) || 0), 0) || 1;

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : orientation === "vertical" ? (
          <div className="flex h-40 items-end gap-3">
            {items.map((item) => (
              <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{ height: `${Math.max(4, (Number(item.value) / max) * 100)}%` }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>
                <p className="w-full truncate text-center text-xs text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xs font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.label}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                  <span className="truncate font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.caption ?? item.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(3, (Number(item.value) / max) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
