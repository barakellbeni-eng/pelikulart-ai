import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["d'outils", "compliqué", "inaccessible", "d'abonnement", "cher"];

const QuoteManifesto = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-28 md:py-40 relative overflow-hidden">
      <div className="w-full flex flex-col items-center justify-center px-4">
        <p className="text-sm sm:text-xl md:text-2xl text-white/50 font-display mb-3 sm:mb-4 tracking-wide text-center">En Afrique, créer avec l'IA c'est</p>
        <div className="relative inline-block" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', 'Helvetica Neue', Arial, sans-serif", fontWeight: 500, lineHeight: 1.1 }}>
            {/* "Trop " is fixed, followed by invisible spacer for the widest word */}
            <span className="text-3xl sm:text-7xl md:text-[90px] text-white tracking-tight">Trop </span>
            <span className="text-3xl sm:text-7xl md:text-[90px] tracking-tight invisible" aria-hidden="true">d'abonnement</span>
            {/* Animated word overlays exactly where the spacer is */}
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute top-0 text-3xl sm:text-7xl md:text-[90px] text-primary tracking-tight whitespace-nowrap"
                style={{ left: "4.2ch" }}
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </div>

        {/* Orange arc with glow */}
        <div className="relative w-full max-w-xs sm:max-w-xl -mt-1 sm:-mt-2">
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
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="1"
              filter="url(#arc-glow)"
              style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.4))" }}
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 sm:mt-32 md:mt-48 text-center max-w-4xl px-4"
        >
          <p className="text-xl sm:text-3xl md:text-5xl text-white font-display font-bold tracking-tight leading-tight">
            Pelikulart AI simplifie tout.
          </p>
          <p className="text-sm sm:text-xl md:text-2xl text-white/50 font-display mt-3 sm:mt-4 leading-relaxed">
            On te forme, on te donne les meilleurs outils pour créer tes clips, pubs et films payable en FCFA, sans abonnement.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteManifesto;
