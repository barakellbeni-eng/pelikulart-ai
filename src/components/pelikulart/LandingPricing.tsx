import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "5 000",
    period: "/mois",
    features: [
      "100 images HD / mois",
      "5 vidéos courtes",
      "Modèles standards",
      "Support email",
    ],
  },
  {
    name: "Pro",
    price: "15 000",
    period: "/mois",
    popular: true,
    features: [
      "500 images HD / mois",
      "25 vidéos 5s",
      "Tous les modèles IA",
      "Priorité de génération",
      "Support prioritaire",
    ],
  },
  {
    name: "Studio",
    price: "35 000",
    period: "/mois",
    features: [
      "Images illimitées",
      "100 vidéos 5s",
      "Modèles premium",
      "API access",
      "Account manager dédié",
    ],
  },
];

const LandingPricing = () => {
  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: "#080808" }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
            Des prix clairs, <span className="text-lime">en FCFA</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm">
            Choisis le plan qui correspond à tes besoins. Annule à tout moment.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.popular
                  ? "bg-white/[0.04] border-2 border-lime/30 ring-1 ring-lime/10"
                  : "bg-white/[0.02] border border-white/5"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-lime text-white text-[10px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}

              <h3 className="text-white font-semibold text-lg font-display">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white font-mono">{plan.price}</span>
                <span className="text-white/30 text-sm ml-1 font-mono">FCFA{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-lime flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={`block w-full text-center py-3 rounded-pill text-sm font-label font-semibold uppercase tracking-wider transition-all ${
                  plan.popular
                    ? "bg-lime text-white hover:bg-lime/90 glow-accent"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Choisir {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
