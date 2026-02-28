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
}

const PaymentMarquee = ({ size = "md", showAvailability = false }: PaymentMarqueeProps) => {
  const logoSize = size === "sm" ? "h-8 w-8" : "h-12 w-12";

  return (
    <div className="space-y-3">
      {showAvailability && (
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            🇧🇯 Bénin · 🇨🇮 Côte d'Ivoire · 🇹🇬 Togo · 🇸🇳 Sénégal — <span className="text-foreground font-medium">Mobile Money</span>
          </p>
          <p className="text-xs text-muted-foreground">
            🌍 Autres pays — <span className="text-foreground font-medium">Visa & Mastercard</span>
          </p>
        </div>
      )}
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee gap-8 w-max">
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
