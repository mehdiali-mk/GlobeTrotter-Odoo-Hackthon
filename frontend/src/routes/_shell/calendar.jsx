import { createFileRoute } from "@tanstack/react-router";
import CalendarPage from "../../pages/CalendarPage";

export const Route = createFileRoute("/_shell/calendar")({
  head: () => ({
    meta: [
      { title: "Travel calendar — GlobeTrotter" },
      { name: "description", content: "Activities from all of your trips, ordered by date." },
      { property: "og:title", content: "Travel calendar — GlobeTrotter" },
      {
        property: "og:description",
        content: "Activities from all of your trips, ordered by date.",
      },
    ],
  }),
  component: CalendarPage,
});
