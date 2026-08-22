import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "../../pages/DashboardPage";

export const Route = createFileRoute("/_shell/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GlobeTrotter" },
      {
        name: "description",
        content: "Your next departure, recent trips and destination highlights in one view.",
      },
      { property: "og:title", content: "Dashboard — GlobeTrotter" },
      {
        property: "og:description",
        content: "Your next departure, recent trips and destination highlights in one view.",
      },
    ],
  }),
  component: DashboardPage,
});
