import { createFileRoute } from "@tanstack/react-router";
import TripItineraryPage from "../../../../pages/TripItineraryPage";

export const Route = createFileRoute("/_shell/trips/$tripId/itinerary")({
  head: () => ({
    meta: [
      { title: "Trip itinerary — GlobeTrotter" },
      {
        name: "description",
        content: "City stops in travel order with the activities planned inside each stop.",
      },
      { property: "og:title", content: "Trip itinerary — GlobeTrotter" },
      {
        property: "og:description",
        content: "City stops in travel order with the activities planned inside each stop.",
      },
    ],
  }),
  component: TripItineraryRoute,
});

function TripItineraryRoute() {
  const { tripId } = Route.useParams();
  return <TripItineraryPage tripId={tripId} />;
}
