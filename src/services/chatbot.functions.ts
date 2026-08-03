/**
 * Server function for AI chatbot using Lovable AI Gateway.
 * Streams responses from Gemini via the gateway.
 */
import { createServerFn } from "@tanstack/react-start";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams a chat completion from the Lovable AI Gateway.
 * Returns the full response text (non-streaming for simplicity in server fn).
 */
export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content: `You are VoxShield AI's cybersecurity education assistant. Your role is to educate users about:
- Phone scam tactics and how to recognize them
- Common social engineering techniques
- How to protect personal information
- What to do if you suspect a scam call
- Identity theft prevention
- Safe online practices

Keep responses concise, friendly, and actionable. Use bullet points and clear formatting.
If asked about topics unrelated to cybersecurity or scam prevention, politely redirect the conversation.`,
            },
            ...data.messages,
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return {
          error: "Rate limit exceeded. Please wait a moment and try again.",
          content: null,
        };
      }
      if (response.status === 402) {
        return {
          error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage.",
          content: null,
        };
      }
      const text = await response.text();
      console.error("AI Gateway error:", response.status, text);
      return { error: "AI service is temporarily unavailable.", content: null };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    return { error: null, content };
  });
