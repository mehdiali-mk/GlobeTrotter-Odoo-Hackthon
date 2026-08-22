import { Link } from "@tanstack/react-router";
import Badge, { StatusBadge } from "./ui/Badge";
import { AvatarGroup } from "./ui/Avatar";
import { formatDateRange, formatMoney, countDays } from "../utils/format";
import { getImageUrl } from "../utils/images";

// Reusable trip summary card. Only shows fields that exist on the trip.
export default function TripCard({ trip, stops = [], members = [], actions = null }) {
  const stopNames = stops.map((stop) => stop.cityName);
  const days = countDays(trip.startDate, trip.endDate);
  const coverUrl = getImageUrl(trip.coverPhoto);

  return (
    <article className="panel group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-raised)]">
      <Link
        to="/trips/$tripId"
        params={{ tripId: trip._id }}
        className="block focus-visible:outline-none"
        aria-label={`Open ${trip.title}`}
      >
        <div className="relative h-36 w-full overflow-hidden bg-surface-muted">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
          <div className="absolute top-3 left-3 flex gap-2">
            <StatusBadge status={trip.status} />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              <Link to="/trips/$tripId" params={{ tripId: trip._id }} className="hover:underline">
                {trip.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDateRange(trip.startDate, trip.endDate)} · {days} days
            </p>
          </div>
          <Badge tone={trip.isPublic ? "primary" : "neutral"}>
            {trip.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        {trip.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
        ) : null}

        {stopNames.length > 0 ? (
          <p className="mt-3 text-sm text-foreground">{stopNames.join(" → ")}</p>
        ) : (
          <p className="mt-3 text-sm text-subtle-foreground">No stops added yet</p>
        )}

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="eyebrow">Budget</p>
            <p className="text-sm font-medium">{formatMoney(trip.totalBudget)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {members.length > 0 ? <AvatarGroup people={members} /> : null}
            <span className="text-xs text-muted-foreground">
              {trip.members.length}/{trip.maxMembers} members
            </span>
          </div>
        </div>

        {actions ? (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}
