/**
 * Home Screen — VoxShield AI landing page.
 * Features the main "Start Monitoring" CTA and app description.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Mic, Brain, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoxShield AI — Real-Time Scam Call Detection" },
      {
        name: "description",
        content:
          "Protect yourself from phone scams with AI-powered real-time call analysis. VoxShield AI detects fraudulent calls instantly.",
      },
      { property: "og:title", content: "VoxShield AI — Real-Time Scam Call Detection" },
      {
        property: "og:description",
        content: "AI-powered real-time scam call detection and protection.",
      },
    ],
  }),
  component: HomePage,
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
  {
    icon: Shield,
    title: "Upload & Analyze",
    description: "Upload call recordings for AI-powered threat analysis",
    link: "/upload",
  },
];

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-12">
      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated shield icon */}
        <motion.div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/15"
          animate={{ boxShadow: ["0 0 20px oklch(0.65 0.22 250 / 0.2)", "0 0 40px oklch(0.65 0.22 250 / 0.4)", "0 0 20px oklch(0.65 0.22 250 / 0.2)"] }}
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

        {/* Start Monitoring CTA */}
        <Link to="/monitoring" className="mt-8 w-full max-w-xs">
          <Button size="lg" className="w-full gap-2 text-base font-semibold h-14 rounded-2xl">
            <Shield className="h-5 w-5" />
            Start Monitoring
          </Button>
        </Link>
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
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
