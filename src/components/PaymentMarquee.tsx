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

const PaymentMarquee = ({ size = "md", showAvailability = false, showSignupCTA = false }: PaymentMarqueeProps) => {
  const logoSize = size === "sm" ? "h-14 w-14" : "h-24 w-24";

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
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 z-10 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 z-10 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />
        <div className="flex animate-marquee gap-12 w-max">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className={`${logoSize} rounded-full object-contain flex-shrink-0`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMarquee;
