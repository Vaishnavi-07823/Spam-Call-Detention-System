import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VoxShield AI — Real-Time Scam Call Detection" },
      { name: "description", content: "AI-powered real-time scam call detection and protection." },
      { name: "author", content: "VoxShield AI" },
      { name: "theme-color", content: "#1a1a2e" },
      { property: "og:title", content: "VoxShield AI — Real-Time Scam Call Detection" },
      { name: "twitter:title", content: "VoxShield AI — Real-Time Scam Call Detection" },
      { property: "og:description", content: "AI-powered real-time scam call detection and protection." },
      { name: "twitter:description", content: "AI-powered real-time scam call detection and protection." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/53454237-cf7a-4473-bc17-df91008e2e23" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/53454237-cf7a-4473-bc17-df91008e2e23" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isConsentPage = location.pathname === "/.lovable/oauth/consent";

  if (isLoginPage || isConsentPage) {
    return (
      <div className="mx-auto max-w-lg min-h-screen relative">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Outlet />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-lg min-h-screen relative">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <Outlet />
        <BottomNav />
      </div>
    </AuthGuard>
  );

}
