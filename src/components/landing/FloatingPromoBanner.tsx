import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingPromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-04-15T23:59:59").getTime();

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
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 z-50 w-[90%] sm:w-auto max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-[hsl(270,60%,50%)] to-[hsl(330,80%,55%)] border border-white/20">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 text-white/80 hover:text-white rounded-full transition-colors z-20 backdrop-blur-sm"
            aria-label="Fermer la bannière"
          >
            <X size={14} />
          </button>

          <div className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <Sparkles size={10} fill="currentColor" />
                OFFRE LIMITÉE!
              </span>
            </div>

            <h3 className="text-3xl font-black text-white leading-none tracking-tight mb-1 drop-shadow-md">
              60% OFF
            </h3>
            <p className="text-white/90 text-sm font-medium mb-4 leading-snug">
              Sur toutes les formations vidéo IA.<br />
              <span className="opacity-75 font-normal">Devenez un pro avant qu'il ne soit trop tard!</span>
            </p>

            <div className="flex items-center gap-2 mb-5 bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/10">
              <Clock className="text-white/80" size={16} />
              <div className="flex gap-2 text-white font-mono text-sm font-bold">
                {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit, i) => (
                  <div key={unit} className="flex items-center gap-1">
                    {i > 0 && <span>:</span>}
                    <div className="flex flex-col items-center leading-none">
                      <span>{String(timeLeft[unit]).padStart(2, '0')}</span>
                      <span className="text-[8px] opacity-60 uppercase">{unit[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/formation">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-white text-[hsl(270,60%,50%)] hover:bg-gray-50 font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm transition-colors group"
              >
                Profiter de l'offre
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingPromoBanner;
