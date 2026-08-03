/**
 * Gemini AI Analysis Service for VoxShield AI
 * 
 * Uses Lovable AI Gateway (Google Gemini) to analyze transcripts
 * for scam intent using natural language understanding.
 */
import { z } from "zod";

/** Schema for the AI analysis response */
const aiAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100),
  category: z.string(),
  reason: z.string(),
  suggestion: z.string(),
});

export type AIAnalysisResult = z.infer<typeof aiAnalysisSchema>;

/**
 * Sends a transcript to Gemini via Lovable AI Gateway for scam analysis.
 * Uses tool calling for structured output extraction.
 */
export async function analyzeWithAI(transcript: string): Promise<AIAnalysisResult> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content: `You are a scam call detection AI. Analyze the given phone call transcript and determine if it's a scam.

Evaluate for these scam indicators:
- Requests for personal information (OTP, passwords, SSN, bank details)
- Urgency or pressure tactics
- Impersonation of authorities (IRS, police, banks)
- Too-good-to-be-true offers (prizes, lottery)
- Requests for unusual payment methods (gift cards, crypto, wire transfers)
- Remote access requests
- Threatening language

Return your analysis using the analyze_transcript tool.`,
        },
        {
          role: "user",
          content: `Analyze this phone call transcript for scam indicators:\n\n"${transcript}"`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_transcript",
            description: "Return structured scam analysis of a phone call transcript",
            parameters: {
              type: "object",
              properties: {
                riskScore: {
                  type: "number",
                  description: "Risk score from 0-100. 0 = completely safe, 100 = definite scam.",
                },
                category: {
                  type: "string",
                  enum: [
                    "credential_theft",
                    "financial_fraud",
                    "identity_theft",
                    "pressure_tactic",
                    "verification_scam",
                    "impersonation",
                    "lottery_scam",
                    "tech_support_scam",
                    "safe",
                  ],
                  description: "The primary scam category detected.",
                },
                reason: {
                  type: "string",
                  description: "Clear explanation of why this was flagged or marked safe.",
                },
                suggestion: {
                  type: "string",
                  description: "Actionable advice for the user on what to do next.",
                },
              },
              required: ["riskScore", "category", "reason", "suggestion"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_transcript" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI Gateway error [${response.status}]:`, errorText);

    if (response.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again shortly.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted.");
    }
    throw new Error(`AI analysis failed with status ${response.status}`);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    console.error("No tool call in AI response:", JSON.stringify(result));
    throw new Error("AI did not return structured analysis");
  }

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    return aiAnalysisSchema.parse(parsed);
  } catch (err) {
    console.error("Failed to parse AI response:", toolCall.function.arguments);
    throw new Error("Invalid AI analysis format");
  }
}
