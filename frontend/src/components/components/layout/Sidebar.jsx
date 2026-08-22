import { Link } from "@tanstack/react-router";
import { ButtonLink } from "../ui/Button";

// Navigation items shown in the sidebar and mobile menu.
export const navigationItems = [
  { label: "Explore", to: "/landing", icon: "compass" },
  { label: "Dashboard", to: "/dashboard", icon: "grid" },
  { label: "My Trips", to: "/trips", icon: "map" },
  { label: "Build Itinerary", to: "/build-itinerary", icon: "list" },
  { label: "Itinerary View", to: "/itinerary-view", icon: "wallet" },
  { label: "Search", to: "/search", icon: "search" },
  { label: "Discover", to: "/discover", icon: "compass" },
  { label: "Community", to: "/community", icon: "users" },
  { label: "Calendar", to: "/calendar", icon: "calendar" },
  { label: "Profile", to: "/profile", icon: "user" },
];

export const adminNavigationItem = { label: "Admin", to: "/admin", icon: "shield" };

function NavIcon({ name }) {
  const paths = {
    grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
    map: <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2zm0 0v14m6-12v14" />,
    compass: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5 5-2z" />,
    list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
    wallet: (
      <path d="M4 7h13a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm0 0a2 2 0 0 1 2-2h9m1 9h2" />
    ),
    search: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm6 -2 4 4" />,

    users: (
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1m3-6a5 5 0 0 1 5 5v1" />
    ),
    calendar: <path d="M5 6h14v14H5zM8 3v4m8-4v4M5 11h14" />,
    user: <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21v-1a7 7 0 0 1 14 0v1" />,
    shield: <path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6l7-3z" />,
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths[name]}
    </svg>
  );
}

export function NavLinks({ items, onNavigate }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
          >
            <NavIcon name={item.icon} />
            <span className="truncate">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function BrandMark({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src="/globetrotter-logo.svg"
        alt="GlobeTrotter"
        className={compact ? "h-10 w-10 object-contain" : "h-16 w-44 object-contain"}
      />
    </Link>
  );
}

export default function Sidebar({ items }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
      <div className="px-5 py-5">
        <BrandMark />
      </div>
      <div className="px-3 pb-3">
        <ButtonLink to="/create-trip" className="w-full justify-center">
          Create trip
        </ButtonLink>
      </div>
      <nav aria-label="Main navigation" className="flex-1 px-3">
        <NavLinks items={items} />
      </nav>
      <div className="border-t border-border px-5 py-4">
        <p className="text-xs text-subtle-foreground">
          Plan multi-city trips, budgets and activities in one place.
        </p>
      </div>
    </aside>
  );
}
