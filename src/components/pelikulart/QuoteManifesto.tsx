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
        <div className="flex items-baseline gap-3 sm:gap-5">
          <span className="text-4xl sm:text-6xl md:text-8xl font-display font-black text-white tracking-tight">
            Trop
          </span>
          <div className="relative h-[1.1em] overflow-hidden" style={{ minWidth: "280px" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 text-4xl sm:text-6xl md:text-8xl font-display font-black text-primary tracking-tight"
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Orange arc */}
        <div className="relative w-full max-w-lg mt-6">
          <svg viewBox="0 0 500 60" fill="none" className="w-full">
            <path
              d="M 30 50 Q 250 -10 470 50"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 30 50 Q 250 -10 470 50"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
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
