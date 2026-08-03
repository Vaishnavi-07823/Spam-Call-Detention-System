/**
 * POST /api/detect — REST API endpoint for scam detection.
 * 
 * Accepts a transcript and returns risk analysis.
 * This route is for external integrations; the frontend uses
 * server functions directly via detection.functions.ts.
 * 
 * Input:  { transcript: "Please share your OTP" }
 * Output: { riskScore: 85, category: "Credential Theft", reason: "...", suggestion: "..." }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { analyzeWithRules, CATEGORY_LABELS } from "@/services/riskAnalyzer";
import { analyzeWithAI } from "@/services/geminiService.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/** Input validation */
const detectSchema = z.object({
  transcript: z
    .string()
    .min(3, "Transcript must be at least 3 characters")
    .max(5000, "Transcript must be under 5000 characters"),
});

export const Route = createFileRoute("/api/detect")({
  server: {
    handlers: {
      /** CORS preflight */
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      /** Analyze transcript for scam indicators */
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          // Validate input
          const parsed = detectSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid input",
                details: parsed.error.issues,
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              }
            );
          }

          const { transcript } = parsed.data;

          // Rule-based analysis
          const ruleResult = analyzeWithRules(transcript);

          // AI-powered analysis
          let aiResult;
          try {
            aiResult = await analyzeWithAI(transcript);
          } catch (err) {
            console.error("AI analysis failed:", err);
            aiResult = {
              riskScore: ruleResult.ruleScore,
              category: ruleResult.primaryCategory,
              reason: ruleResult.reason,
              suggestion:
                ruleResult.ruleScore > 70
                  ? "End the call immediately and block the number."
                  : "This call appears safe, but stay vigilant.",
            };
          }

          // Combine: final = max(rule, ai)
          const finalScore = Math.max(ruleResult.ruleScore, aiResult.riskScore);
          const finalCategory =
            ruleResult.ruleScore >= aiResult.riskScore
              ? ruleResult.primaryCategory
              : aiResult.category;

          const combinedReason =
            ruleResult.matchedKeywords.length > 0 && aiResult.reason
              ? `${aiResult.reason} Keyword matches: ${ruleResult.matchedKeywords
                  .slice(0, 3)
                  .map((m) => `"${m.keyword}"`)
                  .join(", ")}.`
              : aiResult.reason || ruleResult.reason;

          const categoryLabel =
            CATEGORY_LABELS[finalCategory] || finalCategory;

          // Store in database
          try {
            await supabaseAdmin.from("detections").insert({
              transcript,
              risk_score: finalScore,
              category: categoryLabel,
              reason: combinedReason,
              suggestion: aiResult.suggestion,
            });
          } catch (dbErr) {
            console.error("DB insert failed:", dbErr);
          }

          return new Response(
            JSON.stringify({
              riskScore: finalScore,
              category: categoryLabel,
              reason: combinedReason,
              suggestion: aiResult.suggestion,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        } catch (err) {
          console.error("Detection error:", err);
          return new Response(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Internal server error",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      },
    },
  },
});
