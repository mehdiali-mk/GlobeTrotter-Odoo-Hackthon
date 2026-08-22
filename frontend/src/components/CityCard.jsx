import Badge from "./ui/Badge";
import { getImageUrl } from "../utils/images";

// Shows a destination using only the city fields from the data contract.
export default function CityCard({ city, action }) {
  const imageUrl = getImageUrl(city.image);

  return (
    <article className="panel flex flex-col overflow-hidden">
      <div className="h-36 w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{city.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {city.country} · {city.region}
            </p>
          </div>
          {city.isTopAttraction ? <Badge tone="primary">Top attraction</Badge> : null}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{city.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
          <div>
            <dt className="eyebrow">Cost index</dt>
            <dd className="font-medium">{city.costIndex}</dd>
          </div>
          <div>
            <dt className="eyebrow">Popularity</dt>
            <dd className="font-medium">{city.popularity} / 5</dd>
          </div>
        </dl>

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </article>
  );
}
