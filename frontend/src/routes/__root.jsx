import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AppDataProvider } from "../context/AppDataContext";
import { ToastProvider } from "../context/ToastContext";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { NotFoundState, ErrorState } from "../components/ui/States";
import Button from "../components/ui/Button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <NotFoundState
          title="Page not found"
          message="The page you're looking for doesn't exist or has been moved."
        />
      </div>
    </div>
  );
}

function RouteErrorComponent({ error, reset }) {
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <ErrorState
          title="This page didn't load"
          message="Something went wrong while loading this screen. You can try again."
          action={<Button onClick={reset}>Try again</Button>}
        />
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GlobeTrotter — Multi-city trip planning" },
      {
        name: "description",
        content:
          "Plan multi-city trips, itineraries, budgets and activities with your travel group.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RouteErrorComponent,
});

function RootShell({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <ToastProvider>
          {/* Required: nested routes render here. */}
          <Outlet />
        </ToastProvider>
      </AppDataProvider>
    </QueryClientProvider>
  );
}
