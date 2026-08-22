import { createFileRoute } from "@tanstack/react-router";
import AppShell from "../components/layout/AppShell";

// Pathless layout: every signed-in screen renders inside the app shell.
export const Route = createFileRoute("/_shell")({
  component: AppShell,
});
