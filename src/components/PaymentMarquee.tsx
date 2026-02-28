import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import payMastercard from "@/assets/pay-mastercard.png";
import payVisa from "@/assets/pay-visa.png";
import payMixx from "@/assets/pay-mixx.png";
import payWave from "@/assets/pay-wave.png";
import payWari from "@/assets/pay-wari.png";
import payMoov from "@/assets/pay-moov.png";
import payKkiapay from "@/assets/pay-kkiapay.png";
import payMtn from "@/assets/pay-mtn.png";

const logos = [
  { src: payMtn, alt: "MTN Mobile Money" },
  { src: payMoov, alt: "Moov Money" },
  { src: payWave, alt: "Wave" },
  { src: payWari, alt: "Wari" },
  { src: payMixx, alt: "Mixx by Yas" },
  { src: payVisa, alt: "Visa" },
  { src: payMastercard, alt: "Mastercard" },
  { src: payKkiapay, alt: "KkiaPay" },
];

interface PaymentMarqueeProps {
  size?: "sm" | "md";
  showAvailability?: boolean;
  showSignupCTA?: boolean;
}

const VISIBLE_COUNT = 5;

const PaymentMarquee = ({ size = "md", showAvailability = false, showSignupCTA = false }: PaymentMarqueeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxSize = size === "sm" ? 56 : 96;
  const minSize = size === "sm" ? 24 : 36;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Get visible logos centered around currentIndex
  const getVisibleLogos = () => {
    const half = Math.floor(VISIBLE_COUNT / 2);
    const items = [];
    for (let i = -half; i <= half; i++) {
      const idx = (currentIndex + i + logos.length) % logos.length;
      items.push({ ...logos[idx], position: i });
    }
    return items;
  };

  const visibleLogos = getVisibleLogos();

  return (
    <div className="space-y-3">
      {showSignupCTA && (
        <p className="text-center text-sm font-semibold text-white">
          Inscription gratuite • Recevez <span className="text-lime font-bold">50 Cauris gratuits</span> 🐚
        </p>
      )}
      {showAvailability && (
        <div className="text-center space-y-1">
          <p className="text-xs text-white/50">
            🇧🇯 Bénin · 🇨🇮 Côte d'Ivoire · 🇹🇬 Togo · 🇸🇳 Sénégal — <span className="text-white/80 font-medium">Mobile Money</span>
          </p>
          <p className="text-xs text-white/50">
            🌍 Autres pays — <span className="text-white/80 font-medium">Visa & Mastercard</span>
          </p>
        </div>
      )}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

        <div className="flex items-center justify-center gap-6 sm:gap-10 py-4" style={{ minHeight: maxSize + 32 }}>
          <AnimatePresence mode="popLayout">
            {visibleLogos.map((logo) => {
              const distance = Math.abs(logo.position);
              const scale = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.35;
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
              const computedSize = maxSize * scale;

              return (
                <motion.img
                  key={`${logo.alt}-${logo.position}`}
                  src={logo.src}
                  alt={logo.alt}
                  layout
                  initial={{ opacity: 0, scale: 0.2, x: logo.position > 0 ? 80 : -80 }}
                  animate={{
                    opacity,
                    scale,
                    x: 0,
                  }}
                  exit={{ opacity: 0, scale: 0.2, x: logo.position > 0 ? 80 : -80 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="rounded-full object-contain flex-shrink-0"
                  style={{ width: computedSize, height: computedSize }}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PaymentMarquee;
