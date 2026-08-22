import { createFileRoute } from "@tanstack/react-router";
import BuildItineraryPage from "../../pages/BuildItineraryPage";

export const Route = createFileRoute("/_shell/build-itinerary")({
  head: () => ({
    meta: [
      { title: "Build your itinerary — GlobeTrotter" },
      {
        name: "description",
        content:
          "Add trip sections, dates and budgets to build a multi-city itinerary step by step.",
      },
      { property: "og:title", content: "Build your itinerary — GlobeTrotter" },
      {
        property: "og:description",
        content:
          "Add trip sections, dates and budgets to build a multi-city itinerary step by step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuildItineraryPage,
});
