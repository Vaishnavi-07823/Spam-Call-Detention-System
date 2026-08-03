/**
 * API Service for VoxShield AI
 * 
 * Client-side service that calls server functions for
 * scam detection and history retrieval.
 */
import { detectScam, getDetectionHistory } from "@/services/detection.functions";

/** Result returned from the scam detection endpoint */
export interface DetectionResult {
  riskScore: number;
  explanation: string;
  suggestion: string;
  timestamp: string;
  transcript: string;
  category: string;
}

/** History item from the backend */
export interface HistoryItem {
  id: string;
  riskScore: number;
  explanation: string;
  suggestion: string;
  timestamp: string;
  transcript: string;
  category: string;
}

/**
 * Sends a transcript to the backend for AI-powered scam analysis.
 * Uses server function (runs on server, callable from client).
 */
export async function analyzeTranscript(
  transcript: string
): Promise<DetectionResult> {
  return detectScam({ data: { transcript } });
}

/**
 * Fetches the detection history from the database.
 */
export async function fetchHistory(): Promise<HistoryItem[]> {
  return getDetectionHistory();
}
