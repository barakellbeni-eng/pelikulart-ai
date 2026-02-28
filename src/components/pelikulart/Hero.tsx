import { motion } from "framer-motion";
import { ChevronDown, Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
        <iframe
          src="https://app.videas.fr/embed/media/09972d8e-02b2-4f0b-a629-6d1832429455/?autoplay=1&muted=1&loop=1&controls=0&showinfo=0&playsinline=1"
          title="Videas Hero Background"
          className="w-full h-full object-cover pointer-events-none scale-[3.5] md:scale-125"
          style={{ minHeight: "100%", minWidth: "100%" }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[9rem] font-bold mb-6 md:mb-10 leading-[0.9] tracking-tighter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
              LA RÉVOLUTION
            </span>
            <br />
            <span className="text-white">DE L'IMAGE</span>
            <br />
            <span className="text-lime drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">
              PAR L'IA
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl md:text-4xl text-white/90 mb-10 md:mb-14 font-light tracking-wide max-w-5xl mx-auto drop-shadow-lg px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Où la pellicule rencontre le{" "}
            <span className="text-lime font-bold border-b-2 border-lime">futur</span>
          </motion.p>

          <motion.div
            className="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-6 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              to="/creations"
              className="relative z-10 group px-8 py-4 md:px-12 md:py-5 bg-lime text-black rounded-full font-bold text-base md:text-xl hover:bg-[#b3e600] transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.6)] hover:scale-105 flex items-center gap-2 md:gap-3 justify-center whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 fill-black" />
              <span>NOS CRÉATIONS</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/training"
              className="relative z-10 group px-8 py-4 md:px-12 md:py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white rounded-full font-bold text-base md:text-xl hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-white/20 hover:scale-105 flex items-center gap-2 md:gap-3 justify-center whitespace-nowrap"
            >
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
              <span>FORMATION IA</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={24} className="md:w-10 md:h-10 text-lime drop-shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
      </motion.div>
    </section>
  );
};

export default Hero;
