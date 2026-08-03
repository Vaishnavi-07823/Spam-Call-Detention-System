/**
 * Settings Screen — App preferences and information.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Shield,
  Volume2,
  Smartphone,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthSection } from "@/components/AuthSection";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — VoxShield AI" },
      { name: "description", content: "Configure your VoxShield AI preferences." },
    ],
  }),
  component: SettingsPage,
});

interface ToggleSettingProps {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

/** A single toggleable setting row */
function ToggleSetting({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: ToggleSettingProps) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </CardContent>
    </Card>
  );
}

function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoMonitor, setAutoMonitor] = useState(false);
  const [vibration, setVibration] = useState(true);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Account */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AuthSection />
        </motion.div>
      </div>

      {/* Notification Settings */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notifications
        </h2>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <ToggleSetting
              icon={Bell}
              title="Push Notifications"
              description="Get notified when a scam is detected"
              enabled={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ToggleSetting
              icon={Volume2}
              title="Sound Alerts"
              description="Play a sound for high-risk detections"
              enabled={soundAlerts}
              onToggle={() => setSoundAlerts(!soundAlerts)}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ToggleSetting
              icon={Smartphone}
              title="Vibration"
              description="Vibrate on scam detection alerts"
              enabled={vibration}
              onToggle={() => setVibration(!vibration)}
            />
          </motion.div>
        </div>
      </div>

      {/* Monitoring Settings */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Monitoring
        </h2>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ToggleSetting
              icon={Shield}
              title="Auto-Monitor Calls"
              description="Automatically start monitoring incoming calls"
              enabled={autoMonitor}
              onToggle={() => setAutoMonitor(!autoMonitor)}
            />
          </motion.div>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          About
        </h2>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">VoxShield AI</h3>
                    <p className="text-xs text-muted-foreground">
                      Version 1.0.0
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  VoxShield AI uses advanced artificial intelligence to detect
                  scam calls in real time, protecting you from fraud and social
                  engineering attacks.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <a
                  href="https://docs.lovable.dev/features/ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Powered by Lovable AI
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
