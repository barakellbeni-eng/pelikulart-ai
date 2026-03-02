import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: "#080808" }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display leading-tight"
        >
          Commence à créer maintenant
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/40 text-base md:text-lg mt-4 mb-10 max-w-lg mx-auto"
        >
          Rejoins des milliers de créateurs africains et génère tes premiers contenus IA en quelques secondes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-pill font-label text-base tracking-wider uppercase hover:bg-white/90 transition-all"
          >
            Essayer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
