import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const TrainingCTA = () => {
  return (
    <section className="py-32 bg-black relative">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-medium">Formation</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Maîtrisez la création
            <br />
            <span className="text-lime">par l'IA</span>
          </h2>
          <p className="text-base text-white/40 max-w-lg mx-auto leading-relaxed">
            3 heures pour apprendre à produire des vidéos, images et audio avec les meilleurs outils d'intelligence artificielle.
          </p>
          <Link
            to="/training"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-white/90 transition-all group mt-4"
          >
            Découvrir
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrainingCTA;
