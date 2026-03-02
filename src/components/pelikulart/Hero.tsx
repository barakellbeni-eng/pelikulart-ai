import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
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
        <div className="absolute inset-0 z-0 flex items-center justify-center">
        {VIDEO_URLS.map((url, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: activeVideo === i ? 1 : 0 }}
          >
            <div className="w-full" style={{ aspectRatio: "21/9" }}>
              <iframe
                src={url}
                title={`Hero bg ${i + 1}`}
                className="w-full h-full border-0 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                tabIndex={-1}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gradient masks — stronger top/bottom + side fades to hide 21:9 letterbox edges */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: `
          linear-gradient(to bottom, #080808 0%, rgba(8,8,8,0.85) 12%, rgba(8,8,8,0.3) 30%, rgba(8,8,8,0.3) 70%, rgba(8,8,8,0.85) 88%, #080808 100%),
          linear-gradient(to right, #080808 0%, transparent 8%, transparent 92%, #080808 100%)
        `
      }} />

      {/* Orange glow */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none z-[2]"
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
      <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 py-32 md:py-40 flex flex-col items-center text-center">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-[11px] uppercase tracking-[0.35em] text-white/30 font-mono"
        >
          Plateforme IA créative #1 en Afrique
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-3xl font-display"
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
          className="text-lg md:text-xl text-white/50 mt-5 max-w-xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Génère des clips, images et vidéos IA de qualité pro — payable en FCFA via Mobile Money.
        </motion.p>

        {/* Single CTA */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link
            to="/studio"
            onClick={playClickSound}
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-pill font-ui text-base font-semibold tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 glow-accent"
          >
            Lancer ma première génération
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          className="flex flex-col items-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span className="text-[11px] text-white/25 font-mono tracking-widest uppercase">
            Paiements locaux et internationaux acceptés
          </span>
          <div className="flex items-center gap-3 text-xs text-white/35 font-mono">
            <span className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Wave</span>
            <span className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Orange Money</span>
            <span className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">MTN MoMo</span>
            <span className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">Carte bancaire</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
