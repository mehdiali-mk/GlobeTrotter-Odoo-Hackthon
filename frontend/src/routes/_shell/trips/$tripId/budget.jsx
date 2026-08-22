import { createFileRoute } from "@tanstack/react-router";
import TripBudgetPage from "../../../../pages/TripBudgetPage";

export const Route = createFileRoute("/_shell/trips/$tripId/budget")({
  head: () => ({
    meta: [
      { title: "Trip budget — GlobeTrotter" },
      {
        name: "description",
        content: "Expenses by category, per day averages and budget usage for this trip.",
      },
      { property: "og:title", content: "Trip budget — GlobeTrotter" },
      {
        property: "og:description",
        content: "Expenses by category, per day averages and budget usage for this trip.",
      },
    ],
  }),
  component: TripBudgetRoute,
});

function TripBudgetRoute() {
  const { tripId } = Route.useParams();
  return <TripBudgetPage tripId={tripId} />;
}
