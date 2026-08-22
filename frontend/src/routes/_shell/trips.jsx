import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout for every trip related screen.
export const Route = createFileRoute("/_shell/trips")({
  component: () => <Outlet />,
});
