/**
 * RiskScoreGauge component
 * Visual circular gauge displaying the risk score percentage.
 */
import { motion } from "framer-motion";

interface RiskScoreGaugeProps {
  score: number;
  size?: number;
}

export function RiskScoreGauge({ score, size = 160 }: RiskScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Determine color based on score thresholds
  const getColor = () => {
    if (score > 70) return "var(--danger)";
    if (score > 40) return "var(--warning)";
    return "var(--success)";
  };

  const getLabel = () => {
    if (score > 70) return "HIGH RISK";
    if (score > 40) return "MODERATE";
    return "SAFE";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color: getColor() }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold tracking-wider"
        style={{ color: getColor() }}
      >
        {getLabel()}
      </span>
    </div>
  );
}
