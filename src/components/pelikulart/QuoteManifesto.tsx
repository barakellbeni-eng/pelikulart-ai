import { motion } from "framer-motion";

const QuoteManifesto = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white/60 leading-tight"
        >
          "Les meilleurs outils IA du monde{" "}
          <br className="hidden sm:block" />
          ne sont pas faits pour toi."
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary mt-6"
        >
          Pelikulart l'est.
        </motion.p>
      </div>
    </section>
  );
};

export default QuoteManifesto;
