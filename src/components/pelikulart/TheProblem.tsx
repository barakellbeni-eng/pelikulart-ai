import { motion } from "framer-motion";
import { X } from "lucide-react";

const problems = [
  { title: "Interfaces en anglais", desc: "Les outils IA existants ne parlent pas ta langue." },
  { title: "Paiement carte impossible", desc: "Visa internationale obligatoire. Impossible avec Mobile Money." },
  { title: "Prix en dollars", desc: "Trop cher, avec des conversions floues et des frais cachés." },
];

const TheProblem = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
           <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
             Le créateur africain est <span className="text-red-400">exclu</span>
           </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
            Les meilleurs outils IA du monde ne sont pas pensés pour toi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-red-400/10 rounded-xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <X className="w-4 h-4 text-red-400" />
                <h3 className="text-white font-semibold text-sm font-display">{p.title}</h3>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheProblem;
