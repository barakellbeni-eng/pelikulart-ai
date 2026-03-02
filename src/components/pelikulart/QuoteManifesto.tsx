import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["d'outils", "compliqué", "inaccessible", "d'abonnement"];

const QuoteManifesto = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-28 md:py-40 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-3 sm:gap-5" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', 'Helvetica Neue', Arial, sans-serif" }}>
          <span className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight italic">
            Trop
          </span>
          <div className="relative" style={{ height: "1.15em", minWidth: "300px" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute left-0 top-0 text-4xl sm:text-6xl md:text-8xl font-black text-primary tracking-tight italic whitespace-nowrap"
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Orange arc with glow */}
        <div className="relative w-full max-w-md mt-4">
          <svg viewBox="0 0 500 60" fill="none" className="w-full">
            <defs>
              <filter id="arc-glow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 30 55 Q 250 -5 470 55"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#arc-glow)"
            />
          </svg>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl text-white/40 font-display mt-8"
        >
          Pelikulart simplifie tout.
        </motion.p>
      </div>
    </section>
  );
};

export default QuoteManifesto;
