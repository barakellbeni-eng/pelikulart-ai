import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const TrainingCTA = () => {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-lime/5 via-transparent to-lime/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime/10 border border-lime/20 rounded-full text-lime text-sm font-medium">
            <GraduationCap size={16} />
            Formation IA Vidéo
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Devenez un <span className="text-lime">réalisateur IA</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            3 heures de formation intensive pour maîtriser les outils de création vidéo par IA. Du débutant au professionnel.
          </p>
          <Link
            to="/training"
            className="inline-flex items-center gap-3 px-10 py-5 bg-lime text-black rounded-full font-bold text-lg hover:bg-[#b3e600] transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.6)] hover:scale-105 group"
          >
            Découvrir la formation
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrainingCTA;
