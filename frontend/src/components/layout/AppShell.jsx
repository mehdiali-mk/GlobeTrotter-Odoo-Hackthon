import { useState } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import Sidebar, { NavLinks, BrandMark, navigationItems, adminNavigationItem } from "./Sidebar";
import Avatar from "../ui/Avatar";
import Button, { ButtonLink } from "../ui/Button";
import Badge from "../ui/Badge";
import { useToast } from "../../context/ToastContext";
import { useCurrentUser, useLogout } from "../../hooks/useApi";

// Authenticated layout: sidebar on desktop, slide-down menu on small screens.
export default function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useLogout();
  const { showToast } = useToast();
  
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-sm p-6 text-center">
          <p className="font-medium">You are signed out</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue planning your trips.
          </p>
          <ButtonLink to="/login" className="mt-4 w-full justify-center">
            Go to sign in
          </ButtonLink>
        </div>
      </div>
    );
  }

  const items = user.role === "admin" ? [...navigationItems, adminNavigationItem] : navigationItems;

  function handleSignOut() {
    setIsAccountOpen(false);
    logout();
    showToast("Signed out");
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={items} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-muted lg:hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d={isMenuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="lg:hidden">
                <BrandMark compact />
              </div>
              <p className="hidden min-w-0 truncate text-sm text-muted-foreground lg:block">
                {user.city}, {user.country}
              </p>
            </div>

            <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
              <ButtonLink to="/create-trip" size="sm" className="hidden sm:inline-flex">
                Create trip
              </ButtonLink>
              <button
                type="button"
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-expanded={isAccountOpen}
                className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-surface-muted"
              >
                <Avatar name={user.name} photo={user.photo} size="md" />
                <span className="hidden text-sm font-medium sm:block">{user.name}</span>
              </button>

              {isAccountOpen ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-border bg-surface p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Avatar name={user.name} photo={user.photo} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge tone={user.role === "admin" ? "primary" : "neutral"}>{user.role}</Badge>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    className="mt-3 block rounded-md px-2 py-1.5 text-sm hover:bg-surface-muted"
                  >
                    View profile
                  </Link>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full justify-center"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {isMenuOpen ? (
            <nav
              aria-label="Mobile navigation"
              className="border-t border-border px-3 py-3 lg:hidden"
            >
              <NavLinks items={items} onNavigate={() => setIsMenuOpen(false)} />
              <ButtonLink
                to="/create-trip"
                size="sm"
                className="mt-3 w-full justify-center sm:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                Create trip
              </ButtonLink>
            </nav>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-border px-4 py-5 sm:px-6">
          <p className="text-xs text-subtle-foreground">GlobeTrotter · Trip planning workspace</p>
        </footer>
      </div>
    </div>
  );
}
