import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "../pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — GlobeTrotter" },
      {
        name: "description",
        content: "Sign in to plan multi-city trips, itineraries and shared travel budgets.",
      },
      { property: "og:title", content: "Sign in — GlobeTrotter" },
      {
        property: "og:description",
        content: "Sign in to plan multi-city trips, itineraries and shared travel budgets.",
      },
    ],
  }),
  component: LoginPage,
});
