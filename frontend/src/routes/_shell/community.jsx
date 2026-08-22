import { createFileRoute } from "@tanstack/react-router";
import CommunityPage from "../../pages/CommunityPage";

export const Route = createFileRoute("/_shell/community")({
  head: () => ({
    meta: [
      { title: "Community trip plans — GlobeTrotter" },
      {
        name: "description",
        content: "Public itineraries shared by other travellers, ready to copy into your own trip.",
      },
      { property: "og:title", content: "Community trip plans — GlobeTrotter" },
      {
        property: "og:description",
        content: "Public itineraries shared by other travellers, ready to copy into your own trip.",
      },
    ],
  }),
  component: CommunityPage,
});
