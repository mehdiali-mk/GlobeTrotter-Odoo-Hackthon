import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "../../pages/SearchPage";

export const Route = createFileRoute("/_shell/search")({
  head: () => ({
    meta: [
      { title: "Search cities and activities — GlobeTrotter" },
      {
        name: "description",
        content:
          "Search destinations and activities by name, cost, category and rating, then add them to a trip.",
      },
      { property: "og:title", content: "Search cities and activities — GlobeTrotter" },
      {
        property: "og:description",
        content:
          "Search destinations and activities by name, cost, category and rating, then add them to a trip.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});
