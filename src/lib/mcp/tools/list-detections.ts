import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function supabaseForUser(ctx: ToolContext) {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "list_detections",
  title: "List recent scam detections",
  description:
    "List the most recent VoxShield scam-detection results, including risk score, category, transcript excerpt, and explanation.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Number of recent detections to return (1-50)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return {
        content: [{ type: "text", text: "Not authenticated" }],
        isError: true,
      };
    }

    const { data, error } = await supabaseForUser(ctx)
      .from("detections")
      .select("id, risk_score, category, reason, suggestion, transcript, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }

    const rows = data ?? [];
    const text = rows.length
      ? rows
          .map(
            (r) =>
              `[${r.created_at}] ${r.risk_score}/100 — ${r.category}\n  ${r.reason}\n  Transcript: "${r.transcript.slice(0, 140)}${r.transcript.length > 140 ? "…" : ""}"`,
          )
          .join("\n\n")
      : "No detections found.";

    return {
      content: [{ type: "text", text }],
      structuredContent: { detections: rows },
    };
  },
});
