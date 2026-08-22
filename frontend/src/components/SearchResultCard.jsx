import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { getImageUrl } from "../utils/images";

// One result on the search screen. Works for both cities and activities
// because the page maps each record into the same simple shape:
// { id, kind, title, location, description, image, details: [{label, value}] }
export default function SearchResultCard({ result, onViewDetails, action }) {
  const imageUrl = getImageUrl(result.image);

  return (
    <article className="panel flex flex-col overflow-hidden sm:flex-row">
      <div className="h-40 w-full shrink-0 bg-surface-muted sm:h-auto sm:w-44">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{result.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{result.location}</p>
          </div>
          <Badge tone={result.kind === "city" ? "primary" : "neutral"}>
            {result.kind === "city" ? "City" : "Activity"}
          </Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{result.description}</p>

        <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-3">
          {result.details.map((detail) => (
            <div key={detail.label}>
              <dt className="eyebrow">{detail.label}</dt>
              <dd className="font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onViewDetails(result)}>
            View details
          </Button>
          {action}
        </div>
      </div>
    </article>
  );
}
