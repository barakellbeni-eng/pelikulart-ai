import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Smartphone, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { playClickSound } from "@/utils/clickSound";

const VIDEO_URLS = [
  "https://app.videas.fr/embed/media/09972d8e-02b2-4f0b-a629-6d1832429455/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=false&thumbnail=video",
  "https://app.videas.fr/embed/media/c0811c06-78fb-45d2-95a0-66f2c7658863/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=false&thumbnail=video",
  "https://app.videas.fr/embed/media/afcdb619-1b97-481b-b5af-0ddd44fc37b1/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=false&thumbnail=video",
];

const Hero = () => {
  const [activeVideo, setActiveVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % VIDEO_URLS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background video iframes */}
      <div className="absolute inset-0 z-0">
        {VIDEO_URLS.map((url, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: activeVideo === i ? 1 : 0 }}
          >
            <iframe
              src={url}
              title={`Hero bg ${i + 1}`}
              className="w-full h-full border-0 pointer-events-none scale-[1.15]"
              style={{ objectFit: "cover" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1]" style={{ backgroundColor: "rgba(0,0,0,0.50)" }} />

      {/* Orange glow at top center */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(ellipse at center, hsl(23 100% 50% / 0.15) 0%, hsl(23 100% 50% / 0.05) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 py-32 md:py-40 flex flex-col items-center text-center">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime/20 bg-lime/5 text-lime font-mono text-xs tracking-wider animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            Plateforme IA créative #1 en Afrique
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-3xl font-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Créer l'impossible
          <br />
          avec l'
          <span className="text-lime">IA</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/50 mt-5 max-w-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Génère des clips, images et vidéos IA de qualité pro — payable en FCFA via Mobile Money.
        </motion.p>

        {/* Mobile Money badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Smartphone className="w-4 h-4 text-lime" />
          <span className="text-xs text-white/30 font-mono tracking-wide">
            Wave · Orange Money · MTN MoMo · Carte bancaire
          </span>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link
            to="/studio"
            onClick={playClickSound}
            className="group px-8 py-4 bg-lime text-white rounded-pill font-label text-base tracking-wider uppercase hover:bg-lime/90 transition-all flex items-center gap-2 glow-accent"
          >
            Commencer maintenant
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/creations"
            className="px-8 py-4 bg-white/5 text-white rounded-pill font-label text-base tracking-wider uppercase hover:bg-white/10 transition-all border border-white/10"
          >
            Voir nos créations
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
