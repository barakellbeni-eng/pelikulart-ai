import { motion } from "framer-motion";

const ProblemLine = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl text-white/40 font-display leading-snug"
        >
          Les meilleurs outils IA du monde{" "}
          <span className="text-red-400">ne sont pas faits pour toi.</span>
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemLine;
