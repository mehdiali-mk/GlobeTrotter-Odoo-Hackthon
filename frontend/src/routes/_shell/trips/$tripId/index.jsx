import { createFileRoute } from "@tanstack/react-router";
import TripOverviewPage from "../../../../pages/TripOverviewPage";

export const Route = createFileRoute("/_shell/trips/$tripId/")({
  head: () => ({
    meta: [
      { title: "Trip overview — GlobeTrotter" },
      {
        name: "description",
        content: "Stops, members, activities and budget for this trip in one overview.",
      },
      { property: "og:title", content: "Trip overview — GlobeTrotter" },
      {
        property: "og:description",
        content: "Stops, members, activities and budget for this trip in one overview.",
      },
    ],
  }),
  component: TripOverviewRoute,
});

function TripOverviewRoute() {
  const { tripId } = Route.useParams();
  return <TripOverviewPage tripId={tripId} />;
}
