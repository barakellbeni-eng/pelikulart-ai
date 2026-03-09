import { useState } from "react";
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

type TabKey = "image" | "video" | "audio" | "studio";

interface ModelRow {
  name: string;
  detail: string;
  cauris: number;
}

interface BrandGroup {
  brand: string;
  models: ModelRow[];
}

const costData: Record<TabKey, BrandGroup[]> = {
  image: [
    { brand: "GOOGLE", models: [
      { name: "Nano Banana 2", detail: "1K / 2K / 4K", cauris: 1 },
      { name: "Imagen 4 Fast", detail: "Rapide", cauris: 2 },
      { name: "Imagen 4", detail: "Haute qualité", cauris: 3 },
      { name: "Imagen 4 Ultra", detail: "Max détails", cauris: 4 },
    ]},
    { brand: "FLUX", models: [
      { name: "Flux 2 Pro", detail: "Ultra-réaliste", cauris: 3 },
    ]},
    { brand: "SEEDREAM", models: [
      { name: "Seedream 5.0 Lite", detail: "Rapide", cauris: 1 },
      { name: "Seedream 4.5", detail: "Ultra-réaliste", cauris: 2 },
    ]},
  ],
  video: [
    { brand: "KLING", models: [
      { name: "Kling V2.1 Standard", detail: "5s", cauris: 4 },
      { name: "Kling V2.1 Pro", detail: "5s", cauris: 8 },
      { name: "Kling V2.1 Master", detail: "5s", cauris: 23 },
      { name: "Kling 2.5 Turbo", detail: "5s", cauris: 6 },
      { name: "Kling 2.6", detail: "5s", cauris: 8 },
      { name: "Kling 3.0 720p", detail: "5s", cauris: 14 },
      { name: "Kling 3.0 1080p", detail: "5s", cauris: 19 },
    ]},
    { brand: "GOOGLE", models: [
      { name: "Veo 3.1 Fast", detail: "Rapide", cauris: 9 },
      { name: "Veo 3.1", detail: "Cinématique 4K", cauris: 36 },
    ]},
    { brand: "SORA", models: [
      { name: "Sora 2", detail: "10s", cauris: 5 },
      { name: "Sora 2 Pro", detail: "10s Standard", cauris: 22 },
      { name: "Sora 2 Pro High", detail: "10s Qualité max", cauris: 47 },
    ]},
  ],
  audio: [
    { brand: "ELEVENLABS", models: [
      { name: "Sound Effects v2", detail: "Effets sonores", cauris: 1 },
      { name: "Audio Isolation", detail: "Séparer voix/musique", cauris: 1 },
      { name: "Speech to Text", detail: "Transcription", cauris: 1 },
      { name: "TTS Turbo 2.5", detail: "Voix rapide", cauris: 2 },
      { name: "TTS Multilingual v2", detail: "Voix haute qualité", cauris: 3 },
    ]},
    { brand: "SUNO", models: [
      { name: "Generate Lyrics", detail: "Paroles IA", cauris: 1 },
      { name: "Vocal Separation", detail: "Séparer stems", cauris: 3 },
      { name: "Multi-Stem Separation", detail: "Tous les stems", cauris: 10 },
    ]},
  ],
  studio: [
    { brand: "MULTI-PLAN", models: [
      { name: "Vidéo multi-shot", detail: "Automatisé", cauris: 50 },
    ]},
    { brand: "LIP SYNC", models: [
      { name: "Kling Avatar 720p", detail: "Lip sync basique", cauris: 17 },
      { name: "Kling Avatar 1080p", detail: "Lip sync HD", cauris: 34 },
    ]},
  ],
};


const tabLabels: Record<TabKey, string> = {
  image: "Image",
  video: "Vidéo",
  audio: "Audio",
  studio: "Studio",
};

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
  const [activeTab, setActiveTab] = useState<TabKey>("image");

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
          {packs.map((pack, i) => (
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
        <div className="text-center py-3 mb-20 border-t border-b border-white/[0.04]">
          <p className="text-[10px] text-white/25 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
            Vos cauris n'expirent jamais — utilisez-les à votre rythme
          </p>
        </div>

        {/* ═══ COST PER GENERATION ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h3 
            className="text-2xl sm:text-3xl font-bold text-white text-center mb-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Coût par génération
          </h3>
          <p className="text-white/30 text-xs text-center mb-8" style={{ fontFamily: "'DM Mono', monospace" }}>
            Calculé dynamiquement selon le modèle, la résolution et la durée
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-6 mb-8 border-t border-white/[0.06] pt-4">
            {(Object.keys(tabLabels) as TabKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`text-xs uppercase tracking-widest pb-2 transition-all relative ${
                  activeTab === key ? "text-white" : "text-white/30 hover:text-white/50"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {tabLabels[key]}
                {activeTab === key && (
                  <span className="absolute -top-4 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="space-y-6">
            {costData[activeTab].map((group) => (
              <div key={group.brand}>
                <p 
                  className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-3 pl-1"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {group.brand}
                </p>
                <div className="space-y-0">
                  {group.models.map((model, mi) => (
                    <div
                      key={model.name}
                      className={`flex items-center justify-between py-3 px-4 ${
                        mi < group.models.length - 1 ? "border-b border-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-white text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {model.name}
                        </p>
                        <p className="text-white/25 text-[10px] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {model.detail}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <span className="text-white/40 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {(model.cauris * 20).toLocaleString("fr-FR")} FCFA
                        </span>
                        <span className="text-white font-bold text-sm min-w-[3rem] text-right" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {model.cauris}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ COMPARISON TABLE ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 
            className="text-2xl sm:text-3xl font-bold text-white text-center mb-10"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Pourquoi Pelikulart.AI ?
          </h3>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "'DM Mono', monospace" }}>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-4 text-[10px] text-white/30 uppercase tracking-widest font-normal">Critère</th>
                  <th className="text-center py-4 text-[10px] text-white/30 uppercase tracking-widest font-normal">Deepnia</th>
                  <th className="text-center py-4 text-[10px] text-white/30 uppercase tracking-widest font-normal">Kie.ai Direct</th>
                  <th className="text-center py-4 text-[10px] text-white/40 uppercase tracking-widest font-medium bg-white/[0.02]">Pelikulart.AI</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, ri) => (
                  <tr key={row.criterion} className={ri < comparison.length - 1 ? "border-b border-white/[0.03]" : ""}>
                    <td className="py-3 text-white/50 text-xs">{row.criterion}</td>
                    <td className="py-3 text-center text-xs">
                      {typeof row.deepnia === "boolean" 
                        ? (row.deepnia ? <span className="text-white/40">✓</span> : <span className="text-white/20">✗</span>)
                        : <span className="text-white/40">{row.deepnia}</span>
                      }
                    </td>
                    <td className="py-3 text-center text-xs">
                      {typeof row.kie === "boolean"
                        ? (row.kie ? <span className="text-white/40">✓</span> : <span className="text-white/20">✗</span>)
                        : <span className="text-white/40">{row.kie}</span>
                      }
                    </td>
                    <td className="py-3 text-center text-xs bg-white/[0.02]">
                      {typeof row.pelikulart === "boolean"
                        ? (row.pelikulart ? <span className="text-primary font-bold">✓</span> : <span className="text-white/20">✗</span>)
                        : <span className="text-white font-semibold">{row.pelikulart}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {comparison.map((row) => (
              <div key={row.criterion} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="text-white/50 text-xs mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>{row.criterion}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider mb-1">Deepnia</p>
                    <p className="text-white/40">
                      {typeof row.deepnia === "boolean" ? (row.deepnia ? "✓" : "✗") : row.deepnia}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/20 uppercase tracking-wider mb-1">Kie.ai</p>
                    <p className="text-white/40">
                      {typeof row.kie === "boolean" ? (row.kie ? "✓" : "✗") : row.kie}
                    </p>
                  </div>
                  <div className="bg-primary/5 rounded-lg py-1">
                    <p className="text-white/30 uppercase tracking-wider mb-1">Pelikulart</p>
                    <p className={typeof row.pelikulart === "boolean" ? "text-primary font-bold" : "text-white font-semibold"}>
                      {typeof row.pelikulart === "boolean" ? (row.pelikulart ? "✓" : "✗") : row.pelikulart}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default LandingPricing;
