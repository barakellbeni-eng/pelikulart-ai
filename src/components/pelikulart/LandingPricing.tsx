import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import payWave from "@/assets/pay-wave.png";
import payMtn from "@/assets/pay-mtn.png";
import payMoov from "@/assets/pay-moov.png";
import payVisa from "@/assets/pay-visa.png";
import payMastercard from "@/assets/pay-mastercard.png";

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const packs = [
  { name: "Découverte", cauris: 25, price: 2000, images: 25, videos: 3, music: 12 },
  { name: "Starter", cauris: 70, price: 5000, images: 70, videos: 9, music: 35 },
  { name: "Créateur", cauris: 160, price: 10000, images: 160, videos: 20, music: 80, popular: true },
  { name: "Pro", cauris: 450, price: 25000, images: 450, videos: 56, music: 225, bestValue: true },
  { name: "Studio", cauris: 1000, price: 50000, images: 1000, videos: 125, music: 500 },
];

const paymentLogos = [
  { src: payWave, alt: "Wave" },
  { src: payMtn, alt: "MTN MoMo" },
  { src: payMoov, alt: "Orange Money" },
  { src: payVisa, alt: "Visa" },
  { src: payMastercard, alt: "Mastercard" },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

const LandingPricing = () => {
  return (
    <section className="py-20 sm:py-28 md:py-36" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Tarifs
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
            Achetez des cauris, utilisez-les quand vous voulez. Jamais d'abonnement. Jamais d'expiration.
          </p>
        </motion.div>

        {/* ═══ PAYMENT BADGES ═══ */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {paymentLogos.map((logo) => (
            <div
              key={logo.alt}
              className="h-8 px-3 flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.06]"
            >
              <img src={logo.src} alt={logo.alt} className="h-5 w-auto" />
              <span className="text-[10px] text-white/50 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                {logo.alt}
              </span>
            </div>
          ))}
        </div>

        {/* ═══ PACKS GRID ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-3"
        >
          {packs.map((pack) => (
            <div
              key={pack.name}
              className={`relative rounded-2xl p-5 flex flex-col items-center text-center transition-transform ${
                pack.popular ? "lg:-mt-3 lg:mb-3 bg-white/[0.04] border border-white/[0.08]" : "bg-white/[0.02] border border-white/[0.04]"
              }`}
            >
              {pack.popular && (
                <p className="text-[9px] text-white/50 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Le plus populaire
                </p>
              )}
              {pack.bestValue && (
                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Meilleure valeur
                </p>
              )}

              <p className="text-white/50 text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                {pack.name}
              </p>

              <p 
                className="text-4xl sm:text-5xl font-bold text-white my-2"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {pack.cauris}
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
                Cauris
              </p>

              <p className="text-white text-sm font-semibold mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
                {pack.price.toLocaleString("fr-FR")} <span className="text-white/30 text-xs">FCFA</span>
              </p>

              <div className="text-[10px] text-white/40 space-y-1 mb-5" style={{ fontFamily: "'DM Mono', monospace" }}>
                <p>→ {pack.images} images</p>
                <p>→ {pack.videos} vidéos</p>
                <p>→ {pack.music} musiques</p>
              </div>

              <Link
                to="/pricing"
                className={`w-full py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
                  pack.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-white/[0.04] text-white/60 hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                Acheter
              </Link>
            </div>
          ))}
        </motion.div>

        {/* ═══ BAND ═══ */}
        <div className="text-center py-3 border-t border-b border-white/[0.04]">
          <p className="text-[10px] text-white/25 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
            Vos cauris n'expirent jamais — utilisez-les à votre rythme
          </p>
        </div>

      </div>
    </section>
  );
};

export default LandingPricing;
