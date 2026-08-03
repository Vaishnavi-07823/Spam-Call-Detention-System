import { auth, defineMcp } from "@lovable.dev/mcp-js";
import analyzeTranscriptTool from "./tools/analyze-transcript";
import listDetectionsTool from "./tools/list-detections";

const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "voxshield-ai-mcp",
  title: "VoxShield AI",
  version: "0.1.0",
  instructions:
    "Tools for VoxShield AI, a scam call detection service. Use `analyze_transcript` to score a phone call transcript for scam risk. Use `list_detections` to review the signed-in user's recent detections.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [analyzeTranscriptTool, listDetectionsTool],
});
