/**
 * PWAInstallPrompt — Shows a popup prompting users to install VoxShield as a PWA.
 * Listens for the `beforeinstallprompt` event and displays a dismissible dialog.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "voxshield-pwa-dismissed";

export function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Skip if already dismissed in this session or already installed
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone
      window.navigator.standalone === true;

    if (dismissed || isStandalone) return;

    // iOS doesn't fire beforeinstallprompt — show manual instructions
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    if (iOS) {
      setIsIOS(true);
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setOpen(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setOpen(false);
      setInstallEvent(null);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm sm:inset-x-0"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
              {/* Glow accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
              />

              <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="text-base font-semibold">
                    Install VoxShield AI
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isIOS
                      ? "Tap Share, then Add to Home Screen for instant scam protection."
                      : "Get faster access and real-time call protection right from your home screen."}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Not now
                </Button>
                {isIOS ? (
                  <Button
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1 gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Got it
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleInstall}
                    className="flex-1 gap-2"
                    disabled={!installEvent}
                  >
                    <Download className="h-4 w-4" />
                    Install
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
