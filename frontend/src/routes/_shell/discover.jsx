import { createFileRoute } from "@tanstack/react-router";
import DiscoverPage from "../../pages/DiscoverPage";

export const Route = createFileRoute("/_shell/discover")({
  head: () => ({
    meta: [
      { title: "Discover cities and activities — GlobeTrotter" },
      {
        name: "description",
        content: "Browse destinations and things to do, then add them to a trip itinerary.",
      },
      { property: "og:title", content: "Discover cities and activities — GlobeTrotter" },
      {
        property: "og:description",
        content: "Browse destinations and things to do, then add them to a trip itinerary.",
      },
    ],
  }),
  component: DiscoverPage,
});
