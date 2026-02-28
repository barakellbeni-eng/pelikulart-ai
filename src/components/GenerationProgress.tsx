import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface GenerationProgressProps {
  estimatedTime: string; // e.g. "~3s", "~15s", "~2min"
  isComplete?: boolean;
  compact?: boolean;
}

function parseEstimatedSeconds(est: string): number {
  const clean = est.replace("~", "").trim().toLowerCase();
  if (clean.includes("min")) {
    const n = parseFloat(clean) || 1;
    return n * 60;
  }
  return parseFloat(clean) || 5;
}

const GenerationProgress = ({ estimatedTime, isComplete, compact }: GenerationProgressProps) => {
  const totalSeconds = parseEstimatedSeconds(estimatedTime);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startRef.current) / 1000;
      setElapsed(elapsedSec);

      // Easing: fast at start, slows down approaching 92%
      // Using a curve that reaches ~60% at half time, ~85% at full time, caps at 92%
      const ratio = elapsedSec / totalSeconds;
      let fakeProgress: number;

      if (ratio < 0.5) {
        // Fast phase: 0 → 60%
        fakeProgress = ratio * 2 * 60;
      } else if (ratio < 1) {
        // Slower phase: 60% → 85%
        fakeProgress = 60 + ((ratio - 0.5) * 2) * 25;
      } else {
        // Crawl phase: 85% → 92% (very slow)
        const overtime = ratio - 1;
        fakeProgress = 85 + Math.min(overtime * 3, 7);
      }

      setProgress(Math.min(fakeProgress, 92));
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [totalSeconds]);

  // Jump to 100% when complete
  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isComplete]);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const displayTime = remaining >= 60
    ? `${Math.ceil(remaining / 60)}min`
    : `${Math.ceil(remaining)}s`;

  return (
    <div className={`flex flex-col items-center w-full ${compact ? "gap-2 px-3" : "gap-3 px-6"}`}>
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="relative h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/80 to-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          {/* Shimmer effect */}
          {progress < 100 && (
            <motion.div
              className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ left: ["-3rem", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>
      </div>

      {/* Info text */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
        <span className="text-muted-foreground/40">·</span>
        {progress < 100 ? (
          <span>~{displayTime} restant{remaining >= 2 ? "s" : ""}</span>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary font-medium"
          >
            Terminé ✓
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default GenerationProgress;
