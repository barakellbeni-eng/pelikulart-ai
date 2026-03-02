import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ProofSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Eye className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80 font-mono">Preuve</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white/70 leading-relaxed mb-10"
        >
          Découvre ce que Pelikulart a déjà rendu possible.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/creations"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-label font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors glow-accent"
          >
            <Eye className="w-4 h-4" />
            Voir nos créations
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofSection;
