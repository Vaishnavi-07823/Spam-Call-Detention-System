/**
 * History Screen — Displays past scam detection results.
 * Fetches data from backend API.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Static mock data for demonstration
const mockHistoryData = [
  {
    id: "1",
    riskScore: 92,
    explanation: "Multiple red flags detected: Request for OTP, urgency tactics, and impersonation of bank official",
    suggestion: "Immediately hang up and contact your bank directly using their official number",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    transcript: "Hello, this is from State Bank security department. We detected suspicious activity...",
    category: "Financial Fraud"
  },
  {
    id: "2",
    riskScore: 15,
    explanation: "Normal conversation pattern detected. No scam indicators found",
    suggestion: "This appears to be a legitimate call",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    transcript: "Hi, this is Sarah from the delivery service. Your package will arrive tomorrow...",
    category: "Safe"
  },
  {
    id: "3",
    riskScore: 78,
    explanation: "Tech support scam detected: Caller claims computer virus and requests remote access",
    suggestion: "Do not provide remote access. Legitimate companies do not make unsolicited tech support calls",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    transcript: "Your computer has been infected with a virus. We need to access your system immediately...",
    category: "Tech Support Scam"
  },
  {
    id: "4",
    riskScore: 88,
    explanation: "IRS/Tax scam identified: Threats of legal action and demands for immediate payment",
    suggestion: "The IRS never demands immediate payment over the phone. Report this to authorities",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    transcript: "This is the IRS. You owe back taxes and must pay within 24 hours or face arrest...",
    category: "Tax Scam"
  },
  {
    id: "5",
    riskScore: 35,
    explanation: "Possible telemarketing call but no scam indicators",
    suggestion: "Standard sales call. Use your discretion",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    transcript: "Hello, we are offering a special promotion on health insurance...",
    category: "Telemarketing"
  }
];

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Detection History — VoxShield AI" },
      { name: "description", content: "View past scam call detection results." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items] = useState(mockHistoryData);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Detection History</h1>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {items.map((item, i) => {
          const isScam = item.riskScore > 70;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/50 bg-card/50">
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isScam ? "bg-danger/15" : "bg-success/15"
                    }`}
                  >
                    {isScam ? (
                      <AlertTriangle className="h-4 w-4 text-danger" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isScam ? "text-danger" : "text-success"
                        }`}
                      >
                        {isScam ? "SCAM DETECTED" : "SAFE"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Score: {item.riskScore}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {item.explanation}
                    </p>
                    <span className="mt-1 block text-[10px] text-muted-foreground/60">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
