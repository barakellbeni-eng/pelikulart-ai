import { motion } from "framer-motion";

const HourglassLoader = ({ size = 48 }: { size?: number }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ rotate: [0, 0, 180, 180, 360] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.5, 0.8, 1],
        }}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
        >
          {/* Outer frame */}
          <rect x="12" y="4" width="40" height="4" rx="2" className="fill-primary/80" />
          <rect x="12" y="56" width="40" height="4" rx="2" className="fill-primary/80" />

          {/* Glass body */}
          <path
            d="M16 8 L16 22 Q16 32 32 32 Q48 32 48 22 L48 8 Z"
            className="fill-primary/10 stroke-primary/40"
            strokeWidth="1.5"
          />
          <path
            d="M16 56 L16 42 Q16 32 32 32 Q48 32 48 42 L48 56 Z"
            className="fill-primary/10 stroke-primary/40"
            strokeWidth="1.5"
          />

          {/* Top sand (shrinking) */}
          <motion.path
            d="M20 10 L20 20 Q20 28 32 28 Q44 28 44 20 L44 10 Z"
            className="fill-accent/60"
            animate={{ opacity: [1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Bottom sand (growing) */}
          <motion.path
            d="M20 54 L20 48 Q20 40 32 40 Q44 40 44 48 L44 54 Z"
            className="fill-accent/60"
            animate={{ opacity: [0.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Falling stream */}
          <motion.rect
            x="31"
            y="28"
            width="2"
            height="12"
            rx="1"
            className="fill-accent/80"
            animate={{ scaleY: [1, 0.5, 1], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Sparkle particles */}
          {[
            { cx: 26, cy: 16, delay: 0 },
            { cx: 38, cy: 14, delay: 0.5 },
            { cx: 32, cy: 50, delay: 1 },
            { cx: 24, cy: 48, delay: 1.5 },
          ].map((p, i) => (
            <motion.circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r="1.2"
              className="fill-primary"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Pulsing glow ring */}
      <motion.div
        className="w-12 h-1 rounded-full bg-primary/20 blur-sm"
        animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <p className="text-xs text-muted-foreground font-medium tracking-wide">
        Génération en cours…
      </p>
    </div>
  );
};

export default HourglassLoader;
