import { createFileRoute } from "@tanstack/react-router";
import ItineraryViewPage from "../../pages/ItineraryViewPage";

export const Route = createFileRoute("/_shell/itinerary-view")({
  head: () => ({
    meta: [
      { title: "Itinerary and budget view — GlobeTrotter" },
      {
        name: "description",
        content:
          "See a day by day itinerary with activity times, costs and how the trip tracks against its budget.",
      },
      { property: "og:title", content: "Itinerary and budget view — GlobeTrotter" },
      {
        property: "og:description",
        content:
          "See a day by day itinerary with activity times, costs and how the trip tracks against its budget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItineraryViewPage,
});
