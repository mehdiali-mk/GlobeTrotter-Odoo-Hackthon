import { createFileRoute } from "@tanstack/react-router";
import TripCalendarPage from "../../../../pages/TripCalendarPage";

export const Route = createFileRoute("/_shell/trips/$tripId/calendar")({
  head: () => ({
    meta: [
      { title: "Trip calendar — GlobeTrotter" },
      {
        name: "description",
        content: "A day by day calendar of everything scheduled on this trip.",
      },
      { property: "og:title", content: "Trip calendar — GlobeTrotter" },
      {
        property: "og:description",
        content: "A day by day calendar of everything scheduled on this trip.",
      },
    ],
  }),
  component: TripCalendarRoute,
});

function TripCalendarRoute() {
  const { tripId } = Route.useParams();
  return <TripCalendarPage tripId={tripId} />;
}
