import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout for one trip; the tabs render as child routes.
export const Route = createFileRoute("/_shell/trips/$tripId")({
  component: () => <Outlet />,
});
