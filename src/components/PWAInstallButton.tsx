/**
 * PWAInstallButton — Inline button to install VoxShield as a PWA.
 * Always visible (unless already installed). Uses the native install
 * prompt when available; otherwise falls back to manual instructions.
 */
import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isStandalone) return null;

  const handleInstall = async () => {
    // Native prompt available (Chrome / Edge / Android)
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setInstallEvent(null);
      return;
    }
    // iOS Safari — manual instructions
    if (isIOS) {
      setHint("Tap the Share icon, then Add to Home Screen.");
      return;
    }
    // Fallback (desktop Safari, Firefox, in-app browser, preview iframe)
    setHint(
      "Open this site in Chrome, Edge, or Safari, then use the browser menu → Install / Add to Home Screen."
    );
  };

  return (
    <div className="mt-3 flex w-full max-w-xs flex-col items-center">
      <Button
        onClick={handleInstall}
        variant="outline"
        size="lg"
        className="w-full gap-2 text-base font-semibold h-14 rounded-2xl border-primary/40 bg-primary/5 hover:bg-primary/10"
      >
        {isIOS ? (
          <Smartphone className="h-5 w-5 text-primary" />
        ) : (
          <Download className="h-5 w-5 text-primary" />
        )}
        Install the App
      </Button>
      {hint && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
