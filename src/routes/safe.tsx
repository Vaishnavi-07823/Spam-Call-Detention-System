/**
 * Safe Screen — Displayed when the call is determined to be safe.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskScoreGauge } from "@/components/RiskScoreGauge";

interface SafeSearch {
  score: number;
  explanation: string;
}

export const Route = createFileRoute("/safe")({
  head: () => ({
    meta: [
      { title: "✓ Call Safe — VoxShield AI" },
      { name: "description", content: "This call has been verified as safe." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): SafeSearch => ({
    score: Number(search.score) || 15,
    explanation: String(search.explanation || "No suspicious patterns detected."),
  }),
  component: SafePage,
});

function SafePage() {
  const { score, explanation } = Route.useSearch();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-24 pt-8">
      {/* Success icon */}
      <motion.div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/15"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <ShieldCheck className="h-10 w-10 text-success" />
      </motion.div>

      <motion.h1
        className="text-2xl font-bold text-success"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Call is Safe
      </motion.h1>
      <p className="mt-1 text-sm text-muted-foreground">
        No scam indicators were found
      </p>

      {/* Risk Score */}
      <div className="my-8">
        <RiskScoreGauge score={score} />
      </div>

      {/* Details */}
      <div className="w-full max-w-sm space-y-4">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">
              Analysis
            </h3>
            <p className="text-sm leading-relaxed">{explanation}</p>
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
