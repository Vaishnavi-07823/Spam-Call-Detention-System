/**
 * WaveformAnimation component
 * Renders animated bars simulating a live audio waveform during monitoring.
 */
import { motion } from "framer-motion";

interface WaveformAnimationProps {
  isActive: boolean;
  barCount?: number;
}

export function WaveformAnimation({
  isActive,
  barCount = 24,
}: WaveformAnimationProps) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-20">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={
            isActive
              ? {
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5],
                }
              : { scaleY: 0.15, opacity: 0.2 }
          }
          transition={
            isActive
              ? {
                  duration: 0.6 + Math.random() * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }
              : { duration: 0.3 }
          }
          style={{ height: 64, transformOrigin: "center" }}
        />
      ))}
    </div>
  );
}
