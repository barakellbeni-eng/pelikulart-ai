import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const packs = [
  { name: "Découverte", price: "1 000", cauris: 100, features: ["~50 images", "~2 vidéos courtes", "Idéal pour tester"] },
  { name: "Créateur", price: "2 500", cauris: 300, popular: true, features: ["~100 images HD", "~6 vidéos 5s", "+20% bonus Cauris"] },
  { name: "Pro", price: "5 000", cauris: 650, features: ["~200 images HD", "~13 vidéos 5s", "+30% bonus Cauris"] },
  { name: "Studio", price: "10 000", cauris: 1500, features: ["~500 images HD", "~30 vidéos 5s", "+50% bonus Cauris"] },
];

const LandingPricing = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Des prix clairs, <span className="text-lime">en FCFA</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm">
            Pas d'abonnement. Achète des Cauris, utilise-les quand tu veux. Ils n'expirent jamais.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white/[0.03] border rounded-xl p-6 relative ${
                pack.popular ? "border-lime/30 ring-1 ring-lime/10" : "border-white/5"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}
              <h3 className="text-white font-semibold text-sm">{pack.name}</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-lime">{pack.price}</span>
                <span className="text-white/40 text-xs ml-1">FCFA</span>
                <p className="text-white/30 text-xs mt-1">{pack.cauris} Cauris</p>
              </div>
              <ul className="space-y-2 mb-5">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                    <Check className="w-3 h-3 text-lime flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className={`block w-full text-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  pack.popular
                    ? "bg-lime text-white hover:bg-lime/90"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Acheter
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link to="/pricing" className="inline-flex items-center gap-2 text-lime/60 hover:text-lime text-xs transition-colors">
            Voir tous les packs <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPricing;
