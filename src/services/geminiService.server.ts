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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
    throw new Error("Neither LOVABLE_API_KEY nor GEMINI_API_KEY is configured. Please set GEMINI_API_KEY in your environment variables.");
  }

  // If GEMINI_API_KEY is available, call the official Google Gemini API directly
  if (GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a scam call detection AI. Analyze the given phone call transcript and determine if it's a scam.
                
                Evaluate for these scam indicators:
                - Requests for personal information (OTP, passwords, SSN, bank details)
                - Urgency or pressure tactics
                - Impersonation of authorities (IRS, police, banks)
                - Too-good-to-be-true offers (prizes, lottery)
                - Requests for unusual payment methods (gift cards, crypto, wire transfers)
                - Remote access requests
                - Threatening language

                Analyze this transcript:
                "${transcript}"`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              riskScore: {
                type: "INTEGER",
                description: "Risk score from 0-100. 0 = completely safe, 100 = definite scam."
              },
              category: {
                type: "STRING",
                enum: [
                  "credential_theft",
                  "financial_fraud",
                  "identity_theft",
                  "pressure_tactic",
                  "verification_scam",
                  "impersonation",
                  "lottery_scam",
                  "tech_support_scam",
                  "safe"
                ],
                description: "The primary scam category detected."
              },
              reason: {
                type: "STRING",
                description: "Clear explanation of why this was flagged or marked safe."
              },
              suggestion: {
                type: "STRING",
                description: "Actionable advice for the user on what to do next."
              }
            },
            required: ["riskScore", "category", "reason", "suggestion"]
          }
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const resJson = await response.json();
    const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Gemini API did not return text response");
    }

    try {
      const parsed = JSON.parse(textResponse);
      return aiAnalysisSchema.parse(parsed);
    } catch (err) {
      console.error("Failed to parse AI response:", textResponse);
      throw new Error("Invalid AI analysis format");
    }
  }

  // Fallback to Lovable AI Gateway
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
