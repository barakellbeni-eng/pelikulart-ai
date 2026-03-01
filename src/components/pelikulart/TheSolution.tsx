import { motion } from "framer-motion";
import { Check } from "lucide-react";

const solutions = [
  { icon: "🇫🇷", title: "100% en français", desc: "Interface, prompts et support dans ta langue." },
  { icon: "📱", title: "Mobile Money accepté", desc: "Wave, Orange Money, MTN MoMo — paie depuis ton téléphone." },
  { icon: "💰", title: "Prix en FCFA", desc: "Pas de conversion, pas de frais cachés. Tu sais ce que tu paies." },
];

const TheSolution = () => {
  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime/70 mb-4">// La solution</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Pelikulart <span className="text-lime">AI</span> change la donne
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
            Chaque problème a sa réponse. On a tout repensé pour toi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-lime/10 rounded-xl p-6 text-center"
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check className="w-4 h-4 text-lime" />
                <h3 className="text-white font-semibold text-sm">{s.title}</h3>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheSolution;
