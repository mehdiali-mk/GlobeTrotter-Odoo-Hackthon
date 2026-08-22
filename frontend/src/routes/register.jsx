import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "../pages/RegisterPage";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — GlobeTrotter" },
      {
        name: "description",
        content:
          "Create a GlobeTrotter account to build trips and invite the people travelling with you.",
      },
      { property: "og:title", content: "Create your account — GlobeTrotter" },
      {
        property: "og:description",
        content:
          "Create a GlobeTrotter account to build trips and invite the people travelling with you.",
      },
    ],
  }),
  component: RegisterPage,
});
