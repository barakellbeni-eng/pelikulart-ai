import { motion } from "framer-motion";

const ForWho = () => {
  return (
    <section className="py-28 md:py-40" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.9] tracking-tight uppercase font-display">
            Fait pour les
            <br />
            <span className="text-lime">créateurs</span>
            <br />
            <span className="text-lime">africains</span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

export default ForWho;
