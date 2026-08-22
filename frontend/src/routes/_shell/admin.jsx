import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "../../pages/AdminPage";

export const Route = createFileRoute("/_shell/admin")({
  head: () => ({
    meta: [
      { title: "Admin analytics — GlobeTrotter" },
      {
        name: "description",
        content: "Platform analytics across users, trips and the destination catalog.",
      },
      { property: "og:title", content: "Admin analytics — GlobeTrotter" },
      {
        property: "og:description",
        content: "Platform analytics across users, trips and the destination catalog.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});
