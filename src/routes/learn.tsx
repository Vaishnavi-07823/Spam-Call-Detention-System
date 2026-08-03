/**
 * Learn Screen — Cybersecurity tips and education.
 */
import { createFileRoute } from "@tanstack/react-router";
import { AIChatbot } from "@/components/AIChatbot";
import { motion } from "framer-motion";
import {
  BookOpen,
  Phone,
  CreditCard,
  Lock,
  UserX,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — VoxShield AI" },
      { name: "description", content: "Cybersecurity tips to protect yourself from scam calls." },
    ],
  }),
  component: LearnPage,
});

const tips = [
  {
    icon: Phone,
    title: "Don't Trust Caller ID",
    description:
      "Scammers can spoof phone numbers to appear as legitimate organizations. Always verify by calling back on an official number.",
  },
  {
    icon: CreditCard,
    title: "Never Share Financial Info",
    description:
      "Legitimate organizations never ask for credit card numbers, bank details, or PINs over the phone.",
  },
  {
    icon: AlertCircle,
    title: "Beware of Urgency",
    description:
      'Scammers create panic with phrases like "act now" or "your account will be closed." Take time to verify.',
  },
  {
    icon: UserX,
    title: "Don\'t Confirm Personal Details",
    description:
      "If someone claims to know your info, don't confirm it. Scammers fish for verification of partial data.",
  },
  {
    icon: Lock,
    title: "Use Strong Authentication",
    description:
      "Enable two-factor authentication on all accounts. Even if scammers get a password, they can't access your account.",
  },
  {
    icon: Phone,
    title: "Register on Do Not Call List",
    description:
      "Register your number on the national Do Not Call list to reduce unwanted calls from telemarketers.",
  },
];

function LearnPage() {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-24 pt-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Stay Safe</h1>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Essential tips to protect yourself from phone scams
      </p>

      {/* Tip Cards */}
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <tip.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{tip.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
