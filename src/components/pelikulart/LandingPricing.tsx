import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const packs = [
  {
    name: "Starter",
    price: "5 000",
    cauris: 100,
    features: [
      "~50 images HD",
      "~2 vidéos courtes",
      "Tous les modèles standards",
      "Idéal pour tester",
    ],
  },
  {
    name: "Pro",
    price: "15 000",
    cauris: 350,
    popular: true,
    features: [
      "~150 images HD",
      "~8 vidéos 5s",
      "+15% bonus Cauris",
      "Tous les modèles IA",
      "Support prioritaire",
    ],
  },
  {
    name: "Studio",
    price: "35 000",
    cauris: 900,
    features: [
      "~400 images HD",
      "~20 vidéos 5s",
      "+30% bonus Cauris",
      "Modèles premium",
      "Account manager dédié",
    ],
  },
];

const LandingPricing = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
            Recharge et crée. <span className="text-lime">C'est tout.</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm">
            Pas d'abonnement. Achète des Cauris, utilise-les quand tu veux. Ils n'expirent jamais.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${
                pack.popular
                  ? "bg-white/[0.04] border-2 border-lime/30 ring-1 ring-lime/10"
                  : "bg-white/[0.02] border border-white/5"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-lime text-white text-[10px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}

              <h3 className="text-white font-semibold text-lg font-display">{pack.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-white font-mono">{pack.price}</span>
                <span className="text-white/30 text-sm ml-1 font-mono">FCFA</span>
              </div>
              <p className="text-lime text-sm font-mono mb-6">{pack.cauris} Cauris</p>

              <ul className="space-y-3 mb-8 flex-1">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                    <Check className="w-4 h-4 text-lime flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={`block w-full text-center py-3 rounded-pill text-sm font-label font-semibold uppercase tracking-wider transition-all ${
                  pack.popular
                    ? "bg-lime text-white hover:bg-lime/90 glow-accent"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Acheter
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
