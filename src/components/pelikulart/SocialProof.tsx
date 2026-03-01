import { motion } from "framer-motion";

const stats = [
  { value: "2 000+", label: "Créateurs inscrits" },
  { value: "15 000+", label: "Clips & images générés" },
  { value: "8", label: "Pays couverts" },
];

const countries = ["Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Mali", "Burkina Faso", "Niger", "Guinée-Bissau"];

const SocialProof = () => {
  return (
    <section className="py-16 bg-black border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-4xl font-bold text-lime">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Countries */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3"
        >
          {countries.map((c) => (
            <span key={c} className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {c}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
