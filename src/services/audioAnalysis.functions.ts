/**
 * Audio Analysis Server Functions for VoxShield AI
 * 
 * Accepts base64-encoded audio, transcribes it using Gemini's
 * multimodal capabilities, then runs scam detection analysis.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { analyzeWithRules, CATEGORY_LABELS } from "@/services/riskAnalyzer";
import { analyzeWithAI } from "@/services/geminiService.server";

const audioInputSchema = z.object({
  /** Base64-encoded audio data */
  audioBase64: z.string().min(100, "Audio data too short"),
  /** MIME type of the audio file */
  mimeType: z.string().regex(/^audio\//, "Must be an audio file"),
  /** Original filename */
  fileName: z.string().max(255),
});

/**
 * Transcribes audio using Gemini multimodal, then analyzes
 * the transcript for scam indicators.
 */
export const analyzeAudioFile = createServerFn({ method: "POST" })
  .inputValidator((input: { audioBase64: string; mimeType: string; fileName: string }) =>
    audioInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const { audioBase64, mimeType, fileName } = data;

    // Step 1: Transcribe audio using Gemini multimodal
    const transcript = await transcribeAudio(audioBase64, mimeType);

    if (!transcript || transcript.trim().length < 3) {
      throw new Error("Could not transcribe audio. Please ensure the recording contains clear speech.");
    }

    // Step 2: Rule-based analysis
    const ruleResult = analyzeWithRules(transcript);

    // Step 3: AI-powered analysis
    let aiResult;
    try {
      aiResult = await analyzeWithAI(transcript);
    } catch (err) {
      console.error("AI analysis failed, using rules only:", err);
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

    // Step 4: Combine scores
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

    const suggestion =
      aiResult.suggestion ||
      (finalScore > 70
        ? "End the call immediately. Do not share any personal information."
        : finalScore > 40
          ? "Proceed with caution. Verify the caller's identity."
          : "This call appears safe.");

    const categoryLabel = CATEGORY_LABELS[finalCategory] || finalCategory;

    // Step 5: Store in database
    try {
      await supabaseAdmin.from("detections").insert({
        transcript,
        risk_score: finalScore,
        category: categoryLabel,
        reason: combinedReason,
        suggestion,
      });
    } catch (dbErr) {
      console.error("DB insert failed:", dbErr);
    }

    return {
      riskScore: finalScore,
      category: categoryLabel,
      explanation: combinedReason,
      suggestion,
      transcript,
      timestamp: new Date().toISOString(),
      fileName,
    };
  });

/**
 * Transcribes audio using Gemini's multimodal input.
 * Sends the audio as a base64 data part alongside a text prompt.
 */
async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
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
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a precise audio transcription assistant. Transcribe the audio exactly as spoken. Output ONLY the transcript text, nothing else. If the audio is unclear or contains no speech, respond with 'NO_SPEECH_DETECTED'.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe this audio recording of a phone call. Output only the spoken words.",
            },
            {
              type: "input_audio",
              input_audio: {
                data: audioBase64,
                format: mimeType.replace("audio/", ""),
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Transcription error [${response.status}]:`, errorText);
    
    if (response.status === 429) {
      throw new Error("AI rate limit exceeded. Please try again shortly.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted.");
    }
    throw new Error("Failed to transcribe audio. Please try pasting the transcript manually.");
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  
  if (!content || content === "NO_SPEECH_DETECTED") {
    throw new Error("No speech detected in the audio file.");
  }

  return content.trim();
}
