/**
 * BottomNav component
 * Persistent bottom navigation bar for the PWA.
 */
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Shield, Clock, BookOpen, Settings, FileAudio } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/monitoring", icon: Shield, label: "Monitor" },
  { to: "/upload", icon: FileAudio, label: "Upload" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/learn", icon: BookOpen, label: "Learn" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
