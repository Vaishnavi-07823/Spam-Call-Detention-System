import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { analyzeWithRules, CATEGORY_LABELS } from "@/services/riskAnalyzer";
import { analyzeWithAI } from "@/services/geminiService.server";

export default defineTool({
  name: "analyze_transcript",
  title: "Analyze call transcript for scam risk",
  description:
    "Analyze a phone call transcript for scam indicators using VoxShield's combined rule-based + AI detection. Returns a risk score (0-100), category, explanation, and recommended action.",
  inputSchema: {
    transcript: z
      .string()
      .min(3)
      .max(5000)
      .describe("The phone call transcript text to analyze."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ transcript }) => {
    const ruleResult = analyzeWithRules(transcript);

    let aiResult;
    try {
      aiResult = await analyzeWithAI(transcript);
    } catch {
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

    const riskScore = Math.max(ruleResult.ruleScore, aiResult.riskScore);
    const rawCategory =
      ruleResult.ruleScore >= aiResult.riskScore
        ? ruleResult.primaryCategory
        : aiResult.category;
    const category = CATEGORY_LABELS[rawCategory] || rawCategory;
    const explanation =
      ruleResult.matchedKeywords.length > 0 && aiResult.reason
        ? `${aiResult.reason} Additionally, keyword analysis found: ${ruleResult.matchedKeywords
            .slice(0, 3)
            .map((m) => `"${m.keyword}"`)
            .join(", ")}.`
        : aiResult.reason || ruleResult.reason;
    const suggestion = aiResult.suggestion;

    const summary = `Risk ${riskScore}/100 — ${category}\n\n${explanation}\n\nSuggested action: ${suggestion}`;

    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { riskScore, category, explanation, suggestion },
    };
  },
});
