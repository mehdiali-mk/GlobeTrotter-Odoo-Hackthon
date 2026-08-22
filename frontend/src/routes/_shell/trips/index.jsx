import { createFileRoute } from "@tanstack/react-router";
import TripsPage from "../../../pages/TripsPage";

export const Route = createFileRoute("/_shell/trips/")({
  head: () => ({
    meta: [
      { title: "My trips — GlobeTrotter" },
      {
        name: "description",
        content: "Every trip you created or joined, with dates, budgets and members.",
      },
      { property: "og:title", content: "My trips — GlobeTrotter" },
      {
        property: "og:description",
        content: "Every trip you created or joined, with dates, budgets and members.",
      },
    ],
  }),
  component: TripsPage,
});
