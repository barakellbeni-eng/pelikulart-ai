import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-end overflow-hidden bg-black">
      {/* Background Video - full bleed like Runway */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://app.videas.fr/embed/media/09972d8e-02b2-4f0b-a629-6d1832429455/?autoplay=1&muted=1&loop=1&controls=0&showinfo=0&playsinline=1"
          title="Hero Background"
          className="w-full h-full object-cover pointer-events-none scale-[3.5] md:scale-125"
          style={{ minHeight: "100%", minWidth: "100%" }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Content — bottom-left, minimal like Runway */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 pb-16 md:pb-24">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white max-w-3xl"
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
          className="text-lg md:text-xl text-white/60 mt-5 max-w-xl font-light"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Production vidéo, images et audio générés par intelligence artificielle.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 mt-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link
            to="/studio"
            className="group px-7 py-3.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2"
          >
            Commencer
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/creations"
            className="px-7 py-3.5 bg-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/15 transition-all border border-white/10"
          >
            Voir nos créations
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
