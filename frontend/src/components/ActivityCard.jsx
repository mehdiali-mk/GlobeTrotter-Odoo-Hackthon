import Badge from "./ui/Badge";
import { formatMoney, formatHours } from "../utils/format";
import { getImageUrl } from "../utils/images";

// Shows a catalog activity using only the activity fields from the data contract.
export default function ActivityCard({ activity, action }) {
  const imageUrl = getImageUrl(activity.image);

  return (
    <article className="panel flex gap-4 overflow-hidden p-4">
      <div className="hidden h-20 w-24 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:block">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{activity.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {activity.cityName} · {activity.category}
            </p>
          </div>
          <Badge tone="neutral">{activity.rating} / 5</Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{activity.description}</p>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <p className="min-w-0 truncate text-sm">
            <span className="font-medium">{formatMoney(activity.cost)}</span>
            <span className="text-muted-foreground"> · {formatHours(activity.duration)}</span>
          </p>
          {action}
        </div>
      </div>
    </article>
  );
}
