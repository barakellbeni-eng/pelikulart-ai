import payMastercard from "@/assets/pay-mastercard.png";
import payVisa from "@/assets/pay-visa.png";
import payMixx from "@/assets/pay-mixx.png";
import payWave from "@/assets/pay-wave.png";
import payWari from "@/assets/pay-wari.png";
import payMoov from "@/assets/pay-moov.png";
import payKkiapay from "@/assets/pay-kkiapay.png";
import payMtn from "@/assets/pay-mtn.png";
import kkiapayLogo from "@/assets/kkiapay-logo.png";

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

const PaymentMarquee = ({ size = "md", showAvailability = false }: PaymentMarqueeProps) => {
  const logoSize = size === "sm" ? 56 : 80;

  return (
    <div className="space-y-6">
      {showAvailability && (
        <div className="text-center space-y-1">
          <p className="text-xs text-white/50 font-mono">
            Bénin · Côte d'Ivoire · Togo · Sénégal — <span className="text-white/70 font-medium">Mobile Money</span>
          </p>
          <p className="text-xs text-white/50 font-mono">
            Autres pays — <span className="text-white/70 font-medium">Visa & Mastercard</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 flex-wrap">
        {logos.map((logo) => (
          <img
            key={logo.alt}
            src={logo.src}
            alt={logo.alt}
            className="rounded-full object-contain opacity-60 hover:opacity-100 transition-opacity"
            style={{ width: logoSize, height: logoSize }}
          />
        ))}
      </div>

      {showAvailability && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Paiement sécurisé par</span>
          <img src={kkiapayLogo} alt="KkiaPay" className="h-4 object-contain" />
        </div>
      )}
    </div>
  );
};

export default PaymentMarquee;
