import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Koffi A.",
    role: "Rappeur — Abidjan 🇨🇮",
    quote: "J'ai sorti mon premier clip visuel en 24h avec Pelikulart. Avant, il me fallait un budget de 500 000 FCFA minimum.",
  },
  {
    name: "Aminata D.",
    role: "Community Manager — Dakar 🇸🇳",
    quote: "Les visuels IA que je crée pour mes clients sont bluffants. Ils pensent que j'ai une équipe de graphistes.",
  },
  {
    name: "Boris T.",
    role: "Réalisateur — Cotonou 🇧🇯",
    quote: "Le paiement Wave m'a convaincu direct. Pas de Visa, pas de galère. En 30 secondes, mes Cauris étaient prêts.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime/70 mb-4">// Témoignages</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Ils créent avec <span className="text-lime">Pelikulart AI</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-6"
            >
              <p className="text-white/60 text-sm leading-relaxed italic mb-5">"{t.quote}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/30 text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
