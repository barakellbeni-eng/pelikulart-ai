import { motion } from "framer-motion";

const stats = [
  { value: "2 000+", label: "Créateurs" },
  { value: "14 000+", label: "Clips générés" },
  { value: "8", label: "Pays" },
];

const SocialProof = () => {
  return (
    <section className="py-16" style={{ backgroundColor: "#080808" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 flex items-center justify-center"
      >
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            {i > 0 && (
              <div className="h-12 w-px bg-white/10 mx-8 sm:mx-12" />
            )}
            <div className="text-center">
              <p className="text-3xl sm:text-5xl font-bold text-white font-display">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/40 mt-1 font-mono tracking-wider uppercase">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default SocialProof;
