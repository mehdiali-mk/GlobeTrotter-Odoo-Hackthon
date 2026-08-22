import { createFileRoute } from "@tanstack/react-router";
import CreateTripPage from "../../pages/CreateTripPage";

export const Route = createFileRoute("/_shell/create-trip")({
  head: () => ({
    meta: [
      { title: "Create a trip — GlobeTrotter" },
      {
        name: "description",
        content: "Set the dates, budget, visibility and first stop for a new multi-city trip.",
      },
      { property: "og:title", content: "Create a trip — GlobeTrotter" },
      {
        property: "og:description",
        content: "Set the dates, budget, visibility and first stop for a new multi-city trip.",
      },
    ],
  }),
  component: CreateTripPage,
});
