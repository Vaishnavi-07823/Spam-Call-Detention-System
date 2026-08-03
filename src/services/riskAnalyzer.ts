/**
 * Rule-Based Risk Analyzer for VoxShield AI
 * 
 * Scans transcripts for known scam keywords and patterns.
 * Each keyword match increases the risk score.
 * Combined with AI analysis for final scoring.
 */

/** Weighted scam keywords — higher weight = stronger signal */
const SCAM_KEYWORDS: { keyword: string; weight: number; category: string }[] = [
  // Financial fraud signals
  { keyword: "otp", weight: 15, category: "credential_theft" },
  { keyword: "one time password", weight: 15, category: "credential_theft" },
  { keyword: "password", weight: 12, category: "credential_theft" },
  { keyword: "pin number", weight: 12, category: "credential_theft" },
  { keyword: "bank account", weight: 14, category: "financial_fraud" },
  { keyword: "credit card", weight: 14, category: "financial_fraud" },
  { keyword: "social security", weight: 16, category: "identity_theft" },
  { keyword: "ssn", weight: 16, category: "identity_theft" },

  // Urgency & pressure tactics
  { keyword: "urgent", weight: 10, category: "pressure_tactic" },
  { keyword: "immediately", weight: 8, category: "pressure_tactic" },
  { keyword: "right now", weight: 8, category: "pressure_tactic" },
  { keyword: "act fast", weight: 10, category: "pressure_tactic" },
  { keyword: "limited time", weight: 8, category: "pressure_tactic" },
  { keyword: "expire", weight: 7, category: "pressure_tactic" },

  // Verification scams
  { keyword: "verify your", weight: 12, category: "verification_scam" },
  { keyword: "confirm your identity", weight: 13, category: "verification_scam" },
  { keyword: "verify your account", weight: 13, category: "verification_scam" },
  { keyword: "update your information", weight: 10, category: "verification_scam" },

  // Payment & money transfer
  { keyword: "wire transfer", weight: 14, category: "financial_fraud" },
  { keyword: "money transfer", weight: 13, category: "financial_fraud" },
  { keyword: "payment", weight: 8, category: "financial_fraud" },
  { keyword: "gift card", weight: 15, category: "financial_fraud" },
  { keyword: "bitcoin", weight: 12, category: "financial_fraud" },
  { keyword: "cryptocurrency", weight: 10, category: "financial_fraud" },

  // Impersonation signals
  { keyword: "irs", weight: 14, category: "impersonation" },
  { keyword: "tax department", weight: 12, category: "impersonation" },
  { keyword: "law enforcement", weight: 12, category: "impersonation" },
  { keyword: "arrest warrant", weight: 16, category: "impersonation" },
  { keyword: "legal action", weight: 12, category: "impersonation" },
  { keyword: "suspended", weight: 10, category: "impersonation" },

  // Prize/lottery scams
  { keyword: "you have won", weight: 14, category: "lottery_scam" },
  { keyword: "congratulations", weight: 6, category: "lottery_scam" },
  { keyword: "prize", weight: 10, category: "lottery_scam" },
  { keyword: "lottery", weight: 14, category: "lottery_scam" },
  { keyword: "free", weight: 5, category: "lottery_scam" },

  // Tech support scams
  { keyword: "remote access", weight: 15, category: "tech_support_scam" },
  { keyword: "teamviewer", weight: 14, category: "tech_support_scam" },
  { keyword: "anydesk", weight: 14, category: "tech_support_scam" },
  { keyword: "virus detected", weight: 13, category: "tech_support_scam" },
  { keyword: "computer infected", weight: 13, category: "tech_support_scam" },
];

export interface RuleAnalysisResult {
  /** Risk score from rule-based analysis (0-100) */
  ruleScore: number;
  /** Matched keywords with their categories */
  matchedKeywords: { keyword: string; category: string }[];
  /** Primary scam category detected */
  primaryCategory: string;
  /** Human-readable reason */
  reason: string;
}

/**
 * Analyzes a transcript using keyword matching rules.
 * Returns a risk score and matched pattern details.
 */
export function analyzeWithRules(transcript: string): RuleAnalysisResult {
  const lowerTranscript = transcript.toLowerCase();
  const matchedKeywords: { keyword: string; category: string; weight: number }[] = [];
  let totalWeight = 0;

  // Scan for each keyword
  for (const entry of SCAM_KEYWORDS) {
    if (lowerTranscript.includes(entry.keyword)) {
      matchedKeywords.push(entry);
      totalWeight += entry.weight;
    }
  }

  // Cap the rule score at 100
  const ruleScore = Math.min(totalWeight, 100);

  // Determine primary category by frequency
  const categoryCounts: Record<string, number> = {};
  for (const match of matchedKeywords) {
    categoryCounts[match.category] = (categoryCounts[match.category] || 0) + match.weight;
  }

  const primaryCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";

  // Build human-readable reason
  const reason =
    matchedKeywords.length > 0
      ? `Detected ${matchedKeywords.length} suspicious pattern(s): ${matchedKeywords
          .slice(0, 5)
          .map((m) => `"${m.keyword}"`)
          .join(", ")}.`
      : "No suspicious keywords detected.";

  return { ruleScore, matchedKeywords, primaryCategory, reason };
}

/** Category labels for display */
export const CATEGORY_LABELS: Record<string, string> = {
  credential_theft: "Credential Theft",
  financial_fraud: "Financial Fraud",
  identity_theft: "Identity Theft",
  pressure_tactic: "Pressure Tactic",
  verification_scam: "Verification Scam",
  impersonation: "Impersonation",
  lottery_scam: "Lottery/Prize Scam",
  tech_support_scam: "Tech Support Scam",
  unknown: "Unknown",
  safe: "Safe",
};
