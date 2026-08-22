import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../pages/HomePage";

// Screen 1: the public home page is the entry point of the platform.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GlobeTrotter — Plan multi-city trips together" },
      {
        name: "description",
        content:
          "Plan multi-city trips with stops, activities, shared budgets and travel companions in one calm workspace.",
      },
      { property: "og:title", content: "GlobeTrotter — Plan multi-city trips together" },
      {
        property: "og:description",
        content:
          "Plan multi-city trips with stops, activities, shared budgets and travel companions in one calm workspace.",
      },
    ],
  }),
  component: HomePage,
});
