import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "../../pages/ProfilePage";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — GlobeTrotter" },
      {
        name: "description",
        content: "Manage your travel profile, contact details and saved destinations.",
      },
      { property: "og:title", content: "Your profile — GlobeTrotter" },
      {
        property: "og:description",
        content: "Manage your travel profile, contact details and saved destinations.",
      },
    ],
  }),
  component: ProfilePage,
});
