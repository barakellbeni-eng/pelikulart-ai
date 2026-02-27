import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, X } from "lucide-react";

const PromotionalBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-03-15T23:59:59").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { label: "Jours", value: timeLeft.days },
    { label: "Heures", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Secondes", value: timeLeft.seconds },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] opacity-90" />

          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 z-50 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors duration-200"
            aria-label="Fermer la bannière"
          >
            <X size={20} />
          </button>

          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-400/20 rounded-full blur-[60px] pointer-events-none mix-blend-overlay" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg flex items-center gap-1 -rotate-2"
                >
                  <Zap size={12} fill="currentColor" /> OFFRE LIMITÉE!
                </motion.div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight mb-2 mt-4 lg:mt-0 drop-shadow-sm">
                  60% DE RÉDUCTION
                </h2>
                <p className="text-white/90 font-medium text-lg md:text-xl flex flex-wrap justify-center lg:justify-start gap-2 items-center">
                  sur tous les programmes de formation
                  <span className="hidden md:inline-block w-1 h-1 bg-white/50 rounded-full" />
                  <span className="text-white font-bold bg-white/10 px-2 rounded text-sm md:text-lg backdrop-blur-sm">
                    Accès ILLIMITÉ
                  </span>
                </p>
                <p className="text-white/70 text-sm mt-2 max-w-xl mx-auto lg:mx-0 hidden md:block">
                  Inclus : tous les cours + coaching + mises à jour + support premium
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  {timeBlocks.map((block, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <motion.div
                        key={block.value}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-2xl md:text-4xl font-black text-white tabular-nums drop-shadow-md">
                          {String(block.value).padStart(2, "0")}
                        </span>
                      </motion.div>
                      <span className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest mt-2">
                        {block.label}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center mt-4 flex items-center justify-center gap-2 text-white/80 text-sm font-medium"
                >
                  <Timer size={14} />
                  Offre valable jusqu'au 15 Mars
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionalBanner;
