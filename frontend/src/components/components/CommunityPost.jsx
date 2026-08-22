import Card, { CardBody } from "./ui/Card";
import Badge, { StatusBadge } from "./ui/Badge";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import { formatDate, formatMoney, countDays } from "../utils/format";
import { getImageUrl } from "../utils/images";

// One community post: author, trip/activity title, description, location,
// date and the like / comment / share actions.
export default function CommunityPost({
  post,
  author,
  trip,
  stops = [],
  hasLiked,
  onLike,
  onShare,
  onView,
  actions,
}) {
  const coverUrl = trip ? getImageUrl(trip.coverPhoto) : null;
  const location = stops.map((stop) => stop.cityName).join(" → ");

  return (
    <Card as="article" className="overflow-hidden">
      {coverUrl ? (
        <img src={coverUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />
      ) : null}

      <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
          {author ? <Avatar name={author.name} photo={author.photo} /> : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{author ? author.name : "Traveller"}</p>
            <p className="truncate text-xs text-muted-foreground">
              Shared {formatDate(post.createdAt)}
              {author ? ` · ${author.city}, ${author.country}` : ""}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold">{trip ? trip.title : "Trip plan"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{post.caption}</p>
        </div>

        {trip ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={trip.status} />
            <Badge tone="neutral">{location || `${stops.length} cities`}</Badge>
            <Badge tone="neutral">{countDays(trip.startDate, trip.endDate)} days</Badge>
            <Badge tone="neutral">{formatMoney(trip.totalBudget)} budget</Badge>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button variant={hasLiked ? "primary" : "secondary"} size="sm" onClick={onLike}>
            {hasLiked ? "Liked" : "Like"} · {post.likesCount}
          </Button>
          <Button variant="secondary" size="sm" onClick={onView}>
            Comment
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            Share
          </Button>
          {actions}
        </div>
      </CardBody>
    </Card>
  );
}
