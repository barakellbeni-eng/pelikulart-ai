import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0 pointer-events-none"
              style={{ width: "177.78vh", height: "100vh", minWidth: "100%", minHeight: "100%" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        ))}
      </div>

      {/* Gradient masks */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.50) 18%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.50) 82%, rgba(0,0,0,0.95) 100%)"
      }} />

      {/* Orange glow */}
      <div
        className="absolute top-[-100px] sm:top-[-200px] left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] rounded-full pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(ellipse at center, hsl(23 100% 50% / 0.15) 0%, hsl(23 100% 50% / 0.05) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 py-24 sm:py-32 md:py-40 flex flex-col items-center text-center">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base uppercase tracking-[0.25em] sm:tracking-[0.35em] text-white/40 font-mono font-semibold"
        >
          Plateforme IA créative #1 en Afrique
        </motion.p>

        <motion.h1
          className="text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight text-white max-w-3xl font-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Créer l'impossible
          <br />
          avec l'
          <span className="text-primary">IA</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-white/50 mt-4 sm:mt-5 max-w-md sm:max-w-xl px-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Génère des clips, images et vidéos IA de qualité pro — payable en FCFA via Mobile Money.
        </motion.p>

        {/* Single CTA */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-8 sm:mt-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link
            to="/studio"
            onClick={playClickSound}
            className="group px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-primary-foreground rounded-pill font-ui text-sm sm:text-base font-semibold tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 glow-accent"
          >
            Lancer ma première génération
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          className="flex flex-col items-center gap-2 mt-6 sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span className="text-[10px] sm:text-[11px] text-white/25 font-mono tracking-widest uppercase">
            Paiements locaux et internationaux
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-white/35 font-mono">
            <span className="px-2 sm:px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Wave</span>
            <span className="px-2 sm:px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Orange Money</span>
            <span className="px-2 sm:px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">MTN MoMo</span>
            <span className="px-2 sm:px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Carte bancaire</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
