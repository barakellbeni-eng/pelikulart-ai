import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import kkiapayLogo from "@/assets/kkiapay-logo.png";
import { Link } from "react-router-dom";

const packs = [
  {
    name: "Découverte",
    price: "2 000",
    cauris: 25,
    tag: null,
    rows: {
      "Images HD": "25",
      "Vidéo 720p": "3",
      "Vidéo 1080p": "1",
      "Sora 2": "5",
      "Sora Pro": "1",
      "Musique IA": "12",
    },
  },
  {
    name: "Starter",
    price: "5 000",
    cauris: 70,
    tag: null,
    rows: {
      "Images HD": "70",
      "Vidéo 720p": "9",
      "Vidéo 1080p": "5",
      "Sora 2": "14",
      "Sora Pro": "3",
      "Musique IA": "35",
    },
  },
  {
    name: "Créateur",
    price: "10 000",
    cauris: 160,
    tag: "Populaire",
    rows: {
      "Images HD": "160",
      "Vidéo 720p": "20",
      "Vidéo 1080p": "11",
      "Sora 2": "32",
      "Sora Pro": "7",
      "Musique IA": "80",
    },
  },
  {
    name: "Pro",
    price: "25 000",
    cauris: 450,
    tag: null,
    rows: {
      "Images HD": "450",
      "Vidéo 720p": "56",
      "Vidéo 1080p": "32",
      "Sora 2": "90",
      "Sora Pro": "20",
      "Musique IA": "225",
    },
  },
  {
    name: "Studio",
    price: "50 000",
    cauris: 1000,
    tag: "Meilleur rapport",
    rows: {
      "Images HD": "1 000",
      "Vidéo 720p": "125",
      "Vidéo 1080p": "71",
      "Sora 2": "200",
      "Sora Pro": "45",
      "Musique IA": "500",
    },
  },
];

const rowLabels = ["Images HD", "Vidéo 720p", "Vidéo 1080p", "Sora 2", "Sora Pro", "Musique IA"] as const;

const LandingPricing = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
            Recharge et crée. <span className="text-lime">C'est tout.</span>
          </h2>
          <p className="text-white/40 mt-3 max-w-md mx-auto text-xs sm:text-sm">
            Pas d'abonnement. Achète des Cauris, utilise-les quand tu veux. Ils n'expirent jamais.
          </p>
        </motion.div>

        {/* Pricing table — desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden md:block"
        >
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02]">
            {/* Header row */}
            <div className="grid grid-cols-6 border-b border-white/[0.06]">
              <div className="p-4" />
              {packs.map((pack) => (
                <div key={pack.name} className="p-4 text-center relative">
                  {pack.tag && (
                    <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-lime text-white text-[9px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      {pack.tag}
                    </span>
                  )}
                  <p className="text-white font-semibold text-sm font-display">{pack.name}</p>
                  <p className="mt-1">
                    <span className="text-2xl font-bold text-white font-mono">{pack.price}</span>
                    <span className="text-white/30 text-[10px] ml-1 font-mono">FCFA</span>
                  </p>
                  <p className="text-lime text-[11px] font-mono mt-0.5">{pack.cauris} Cauris 🐚</p>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {rowLabels.map((label, ri) => (
              <div
                key={label}
                className={`grid grid-cols-6 ${ri < rowLabels.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <div className="p-3 pl-5 text-white/50 text-xs font-mono flex items-center">{label}</div>
                {packs.map((pack) => (
                  <div key={pack.name} className="p-3 text-center">
                    <span className="text-white font-semibold text-sm font-mono">
                      {pack.rows[label]}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-6 border-t border-white/[0.06]">
              <div className="p-4" />
              {packs.map((pack) => (
                <div key={pack.name} className="p-4 flex justify-center">
                  <Link
                    to="/pricing"
                    className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                      pack.tag === "Populaire"
                        ? "bg-lime text-white hover:bg-lime/90 glow-accent"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    Acheter
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pricing cards — mobile */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-5 flex flex-col ${
                pack.tag === "Populaire"
                  ? "bg-white/[0.04] border-2 border-lime/30"
                  : "bg-white/[0.02] border border-white/5"
              }`}
            >
              {pack.tag && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-lime text-white text-[9px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {pack.tag}
                </span>
              )}
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-white font-semibold text-base font-display">{pack.name}</h3>
                <p className="text-lime text-xs font-mono">{pack.cauris} 🐚</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white font-mono">{pack.price}</span>
                <span className="text-white/30 text-xs ml-1 font-mono">FCFA</span>
              </div>

              <div className="space-y-1.5 mb-5 flex-1">
                {rowLabels.map((label) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-white/40 font-mono">{label}</span>
                    <span className="text-white font-semibold font-mono">{pack.rows[label]}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/pricing"
                className={`block w-full text-center py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                  pack.tag === "Populaire"
                    ? "bg-lime text-white hover:bg-lime/90 glow-accent"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Acheter
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mention */}
        <p className="text-center text-white/20 text-[10px] font-mono mt-4">
          Estimations basées sur les coûts par modèle. Usage réel peut varier selon la résolution et les options choisies.
        </p>

        {/* KkiaPay */}
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
          <img src={kkiapayLogo} alt="KkiaPay" className="h-8 sm:h-10 opacity-80" />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPricing;
