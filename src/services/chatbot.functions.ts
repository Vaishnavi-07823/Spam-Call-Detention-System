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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!LOVABLE_API_KEY && !GEMINI_API_KEY) {
      throw new Error("Neither LOVABLE_API_KEY nor GEMINI_API_KEY is configured.");
    }

    const url = GEMINI_API_KEY 
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";

    const apiKey = GEMINI_API_KEY || LOVABLE_API_KEY;
    const model = GEMINI_API_KEY ? "gemini-1.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
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
    });

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
