import { Link } from "@tanstack/react-router";

// Sub navigation inside a single trip. Keeps the trip context visible.
const tabs = [
  { label: "Overview", to: "/trips/$tripId" },
  { label: "Itinerary", to: "/trips/$tripId/itinerary" },
  { label: "Budget", to: "/trips/$tripId/budget" },
  { label: "Calendar", to: "/trips/$tripId/calendar" },
];

export default function TripTabs({ tripId }) {
  return (
    <nav aria-label="Trip sections" className="mb-6 border-b border-border">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <Link
              to={tab.to}
              params={{ tripId }}
              activeOptions={{ exact: true }}
              className="inline-block border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:text-primary"
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
