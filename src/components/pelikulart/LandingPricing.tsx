import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import kkiapayLogo from "@/assets/kkiapay-logo.png";
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
    <section className="py-16 sm:py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
            Recharge et crée. <span className="text-lime">C'est tout.</span>
          </h2>
          <p className="text-white/40 mt-3 sm:mt-4 max-w-md mx-auto text-xs sm:text-sm">
            Pas d'abonnement. Achète des Cauris, utilise-les quand tu veux. Ils n'expirent jamais.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-5 sm:p-7 flex flex-col ${
                pack.popular
                  ? "bg-white/[0.04] border-2 border-lime/30 ring-1 ring-lime/10"
                  : "bg-white/[0.02] border border-white/5"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 bg-lime text-white text-[10px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}

              <h3 className="text-white font-semibold text-base sm:text-lg font-display">{pack.name}</h3>
              <div className="mt-3 sm:mt-4 mb-1 sm:mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white font-mono">{pack.price}</span>
                <span className="text-white/30 text-xs sm:text-sm ml-1 font-mono">FCFA</span>
              </div>
              <p className="text-lime text-xs sm:text-sm font-mono mb-4 sm:mb-6">{pack.cauris} Cauris</p>

              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/60">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={`block w-full text-center py-2.5 sm:py-3 rounded-pill text-xs sm:text-sm font-label font-semibold uppercase tracking-wider transition-all ${
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

        {/* Sécurité KkiaPay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-2 mt-8 sm:mt-12"
        >
          <div className="flex items-center gap-2 text-white/40">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[11px] sm:text-xs font-mono tracking-wide">Paiement sécurisé par</span>
          </div>
          <img src={kkiapayLogo} alt="KkiaPay" className="h-6 sm:h-7 opacity-50" />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPricing;
