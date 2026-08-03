/**
 * Login Landing Page — Sign in to access VoxShield AI.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Shield, Mic, Brain, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAInstallButton } from "@/components/PWAInstallButton";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — VoxShield AI" },
      {
        name: "description",
        content:
          "Sign in to VoxShield AI for real-time scam call detection and protection.",
      },
    ],
  }),
  component: LoginPage,
});

const features = [
  {
    icon: Mic,
    title: "Live Speech Capture",
    description: "Continuously listens and transcribes calls in real time",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Advanced AI models detect scam patterns instantly",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get warned immediately when a scam is detected",
  },
];

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();

  useEffect(() => {
    if (!loading && user) {
      if (next) {
        window.location.href = next;
      } else {
        navigate({ to: "/" });
      }
    }
  }, [user, loading, navigate, next]);

  const handleGoogleSignIn = async () => {
    const redirectUri = next
      ? `${window.location.origin}${next}`
      : window.location.origin;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUri,
    });
    if (result.error) {
      console.error("Sign-in error:", result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      {/* Hero */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/15"
          animate={{
            boxShadow: [
              "0 0 20px oklch(0.65 0.22 250 / 0.2)",
              "0 0 40px oklch(0.65 0.22 250 / 0.4)",
              "0 0 20px oklch(0.65 0.22 250 / 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="h-12 w-12 text-primary" />
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight">
          Vox<span className="text-primary">Shield</span> AI
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Real-time AI-powered scam call detection. Stay protected from
          fraudulent calls with intelligent speech analysis.
        </p>

        {/* Sign in CTA */}
        <Button
          onClick={handleGoogleSignIn}
          size="lg"
          className="mt-8 w-full max-w-xs gap-2 text-base font-semibold h-14 rounded-2xl"
        >
          <Shield className="h-5 w-5" />
          Sign in with Google
        </Button>

        <PWAInstallButton />
      </motion.div>

      {/* Feature Cards */}
      <div className="mt-12 grid w-full max-w-sm gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
          >
            <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <PWAInstallPrompt />
    </div>
  );
}
