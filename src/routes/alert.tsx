/**
 * Alert Screen — Displayed when a high-risk scam call is detected.
 * Shows risk score, explanation, and recommended actions.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, PhoneOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";

interface AlertSearch {
  score: number;
  explanation: string;
  suggestion: string;
}

export const Route = createFileRoute("/alert")({
  head: () => ({
    meta: [
      { title: "⚠️ Scam Alert — VoxShield AI" },
      { name: "description", content: "A potential scam call has been detected." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): AlertSearch => ({
    score: Number(search.score) || 85,
    explanation: String(search.explanation || "Suspicious patterns detected in the call."),
    suggestion: String(search.suggestion || "End the call immediately and block the number."),
  }),
  component: AlertPage,
});

function AlertPage() {
  const { score, explanation, suggestion } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-8">
      {/* Pulsing warning icon */}
      <motion.div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-danger/15"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0 oklch(0.58 0.22 25 / 0.3)",
            "0 0 0 20px oklch(0.58 0.22 25 / 0)",
            "0 0 0 0 oklch(0.58 0.22 25 / 0)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AlertTriangle className="h-10 w-10 text-danger" />
      </motion.div>

      <motion.h1
        className="text-2xl font-bold text-danger"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Scam Detected!
      </motion.h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This call shows high-risk scam indicators
      </p>

      {/* Risk Score */}
      <div className="my-8">
        <RiskScoreGauge score={score} />
      </div>

      {/* Details */}
      <div className="w-full max-w-sm space-y-4">
        <Card className="border-danger/20 bg-danger/5">
          <CardContent className="p-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-danger">
              Analysis
            </h3>
            <p className="text-sm leading-relaxed">{explanation}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex items-start gap-3 p-4">
            <PhoneOff className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended Action
              </h3>
              <p className="text-sm leading-relaxed">{suggestion}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link to="/monitoring" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              New Scan
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
