import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import kkiapayLogo from "@/assets/kkiapay-logo.png";
import { Link } from "react-router-dom";

const packs = [
  { name: "Découverte", price: "2 000", cauris: 25, tag: null,
    rows: { "Images HD": "25", "Vidéo 720p": "3", "Vidéo 1080p": "1", "Sora 2": "5", "Sora Pro": "1", "Musique": "12" } },
  { name: "Starter", price: "5 000", cauris: 70, tag: null,
    rows: { "Images HD": "70", "Vidéo 720p": "9", "Vidéo 1080p": "5", "Sora 2": "14", "Sora Pro": "3", "Musique": "35" } },
  { name: "Créateur", price: "10 000", cauris: 160, tag: "Populaire",
    rows: { "Images HD": "160", "Vidéo 720p": "20", "Vidéo 1080p": "11", "Sora 2": "32", "Sora Pro": "7", "Musique": "80" } },
  { name: "Pro", price: "25 000", cauris: 450, tag: null,
    rows: { "Images HD": "450", "Vidéo 720p": "56", "Vidéo 1080p": "32", "Sora 2": "90", "Sora Pro": "20", "Musique": "225" } },
  { name: "Studio", price: "50 000", cauris: 1000, tag: "Best value",
    rows: { "Images HD": "1 000", "Vidéo 720p": "125", "Vidéo 1080p": "71", "Sora 2": "200", "Sora Pro": "45", "Musique": "500" } },
];

const rowLabels = Object.keys(packs[0].rows) as (keyof typeof packs[0]["rows"])[];

const LandingPricing = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-display">
            Recharge et crée. <span className="text-lime">C'est tout.</span>
          </h2>
          <p className="text-white/35 mt-3 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
            Pas d'abonnement. Achète des Cauris, utilise-les quand tu veux.
          </p>
        </motion.div>

        {/* ═══ Desktop table ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden lg:block"
        >
          <div className="rounded-3xl border border-white/[0.06] overflow-hidden backdrop-blur-sm">
            {/* Pack headers */}
            <div className="grid grid-cols-[1.4fr_repeat(5,1fr)]">
              <div className="p-5" />
              {packs.map((pack) => (
                <div
                  key={pack.name}
                  className={`p-5 text-center relative ${
                    pack.tag === "Populaire" ? "bg-lime/[0.04]" : ""
                  }`}
                >
                  {pack.tag && (
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-lime/90 text-black text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      {pack.tag}
                    </span>
                  )}
                  <p className="text-white/60 text-[11px] font-mono uppercase tracking-widest mt-3">
                    {pack.name}
                  </p>
                  <p className="mt-2">
                    <span className="text-2xl font-bold text-white font-mono tracking-tight">
                      {pack.price}
                    </span>
                    <span className="text-white/20 text-[10px] ml-1">FCFA</span>
                  </p>
                  <p className="text-lime/80 text-[11px] font-mono mt-1">{pack.cauris} Cauris</p>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* Rows */}
            {rowLabels.map((label, ri) => (
              <div
                key={label}
                className={`grid grid-cols-[1.4fr_repeat(5,1fr)] transition-colors hover:bg-white/[0.015] ${
                  ri < rowLabels.length - 1 ? "border-b border-white/[0.03]" : ""
                }`}
              >
                <div className="py-3.5 px-5 text-white/40 text-[11px] font-mono tracking-wide flex items-center">
                  {label}
                </div>
                {packs.map((pack) => (
                  <div
                    key={pack.name}
                    className={`py-3.5 text-center ${
                      pack.tag === "Populaire" ? "bg-lime/[0.04]" : ""
                    }`}
                  >
                    <span className="text-white/90 text-sm font-mono font-medium">
                      {pack.rows[label]}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* CTA row */}
            <div className="grid grid-cols-[1.4fr_repeat(5,1fr)]">
              <div className="p-4" />
              {packs.map((pack) => (
                <div
                  key={pack.name}
                  className={`p-4 flex justify-center ${
                    pack.tag === "Populaire" ? "bg-lime/[0.04]" : ""
                  }`}
                >
                  <Link
                    to="/pricing"
                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      pack.tag === "Populaire"
                        ? "bg-lime text-black hover:bg-lime/90 shadow-[0_0_20px_hsl(82_85%_55%/0.25)]"
                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15]"
                    }`}
                  >
                    Acheter
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ Mobile cards ═══ */}
        <div className="lg:hidden space-y-3">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl p-5 relative ${
                pack.tag === "Populaire"
                  ? "bg-white/[0.04] border border-lime/20"
                  : "bg-white/[0.02] border border-white/[0.05]"
              }`}
            >
              {pack.tag && (
                <span className="absolute -top-2 right-4 bg-lime/90 text-black text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  {pack.tag}
                </span>
              )}

              {/* Top: name + price inline */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-sm font-display">{pack.name}</p>
                  <p className="text-lime/70 text-[11px] font-mono mt-0.5">{pack.cauris} Cauris 🐚</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white font-mono">{pack.price}</span>
                  <span className="text-white/20 text-[10px] ml-1">FCFA</span>
                </div>
              </div>

              {/* Compact grid of capabilities */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-2 mb-4">
                {rowLabels.map((label) => (
                  <div key={label} className="text-center">
                    <p className="text-white font-bold text-sm font-mono">{pack.rows[label]}</p>
                    <p className="text-white/30 text-[9px] font-mono leading-tight mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/pricing"
                className={`block w-full text-center py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  pack.tag === "Populaire"
                    ? "bg-lime text-black hover:bg-lime/90"
                    : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                Acheter
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-white/15 text-[9px] font-mono mt-6 tracking-wide">
          Estimations basées sur les coûts par modèle · Usage réel varie selon les options
        </p>

        {/* KkiaPay badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mt-8 sm:mt-10"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white/25" />
          <span className="text-[10px] text-white/25 font-mono">Sécurisé par</span>
          <img src={kkiapayLogo} alt="KkiaPay" className="h-6 opacity-50" />
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPricing;
