import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationProgressProps {
  estimatedTime: string;
  isComplete?: boolean;
  compact?: boolean;
}

function parseEstimatedSeconds(est: string): number {
  const clean = est.replace("~", "").trim().toLowerCase();
  if (clean.includes("min")) return (parseFloat(clean) || 1) * 60;
  return parseFloat(clean) || 5;
}

const waitingMessages = [
  "Presque terminé…",
  "Un instant…",
  "Patience, ça arrive…",
  "Finalisation…",
];

const GenerationProgress = ({ estimatedTime, isComplete, compact }: GenerationProgressProps) => {
  const totalSeconds = parseEstimatedSeconds(estimatedTime);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [waitMsg, setWaitMsg] = useState(0);
  const startRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    setProgress(0);
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      const sec = (Date.now() - startRef.current) / 1000;
      setElapsed(sec);
      const r = sec / totalSeconds;
      let p: number;
      if (r < 0.5) p = r * 2 * 65;
      else if (r < 1) p = 65 + (r - 0.5) * 2 * 22;
      else p = 87 + Math.min((r - 1) * 2.5, 7);
      setProgress(Math.min(p, 94));
    }, 80);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [totalSeconds]);

  // Cycle waiting messages when stuck > 90%
  useEffect(() => {
    if (progress < 90) return;
    const t = setInterval(() => setWaitMsg(v => (v + 1) % waitingMessages.length), 2500);
    return () => clearInterval(t);
  }, [progress >= 90]);

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isComplete]);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const timeLabel = remaining >= 60 ? `~${Math.ceil(remaining / 60)}min` : `~${Math.ceil(remaining)}s`;

  return (
    <div className={`flex flex-col items-center w-full ${compact ? "gap-1.5" : "gap-2"}`}>
      {/* Bar */}
      <div className={`w-full ${compact ? "max-w-[120px]" : "max-w-[180px]"}`}>
        <div className="h-[3px] rounded-full bg-muted/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary/70"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={progress >= 100 ? "done" : progress >= 90 ? `wait-${waitMsg}` : "time"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`text-[10px] text-muted-foreground/70 ${compact ? "" : "text-xs"}`}
        >
          {progress >= 100
            ? "✓"
            : progress >= 90
              ? waitingMessages[waitMsg]
              : timeLabel}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default GenerationProgress;
