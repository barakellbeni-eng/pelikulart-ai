import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

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
      <div className="w-full flex flex-col items-center justify-center">
          <div className="relative inline-block font-display" style={{ fontWeight: 700, lineHeight: 1.1 }}>
            <span className="text-5xl sm:text-6xl md:text-[75px] text-white tracking-tight font-bold">Trop </span>
            <span className="text-5xl sm:text-6xl md:text-[75px] tracking-tight invisible font-bold" aria-hidden="true">d'abonnement</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute top-0 text-5xl sm:text-6xl md:text-[75px] text-primary tracking-tight whitespace-nowrap font-bold"
                style={{ left: "4.2ch" }}
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </div>

        {/* Orange arc with glow */}
        <div className="relative w-full max-w-xl -mt-2">
          <svg viewBox="0 0 500 40" fill="none" className="w-full">
            <defs>
              <filter id="arc-glow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 15 38 Q 250 -5 485 38"
              stroke="hsl(var(--primary))"
              strokeWidth="7"
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
