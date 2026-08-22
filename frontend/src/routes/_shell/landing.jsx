import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../../pages/LandingPage";

export const Route = createFileRoute("/_shell/landing")({
  head: () => ({
    meta: [
      { title: "Explore destinations — GlobeTrotter" },
      {
        name: "description",
        content:
          "Search destinations, group and sort regional selections and revisit your previous trips.",
      },
      { property: "og:title", content: "Explore destinations — GlobeTrotter" },
      {
        property: "og:description",
        content:
          "Search destinations, group and sort regional selections and revisit your previous trips.",
      },
    ],
  }),
  component: LandingPage,
});
