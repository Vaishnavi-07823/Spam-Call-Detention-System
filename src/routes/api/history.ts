/**
 * GET /api/history — REST API endpoint for detection history.
 * 
 * Returns the 50 most recent scam detections.
 * Output: [{ id, riskScore, category, reason, suggestion, timestamp, transcript }]
 */
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const Route = createFileRoute("/api/history")({
  server: {
    handlers: {
      /** CORS preflight */
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      /** Fetch detection history */
      GET: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("detections")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

          if (error) {
            console.error("History query error:", error);
            return new Response(
              JSON.stringify({ error: "Failed to fetch history" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              }
            );
          }

          const history = (data || []).map((d) => ({
            id: d.id,
            riskScore: d.risk_score,
            category: d.category,
            reason: d.reason,
            suggestion: d.suggestion,
            timestamp: d.created_at,
            transcript: d.transcript,
          }));

          return new Response(JSON.stringify(history), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          console.error("History error:", err);
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
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
