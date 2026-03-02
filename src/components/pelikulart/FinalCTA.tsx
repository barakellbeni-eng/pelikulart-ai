import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold text-white font-display leading-tight"
        >
          Prêt à redéfinir les règles du jeu visuel ?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black rounded-pill font-ui text-sm sm:text-base font-semibold tracking-wider hover:bg-white/90 transition-all"
          >
            Recharger mes Cauris et Créer
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
