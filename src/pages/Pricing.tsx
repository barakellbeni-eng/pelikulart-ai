import { useState } from "react";
import { Check, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "kkiapay-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        amount?: string;
        key?: string;
        callback?: string;
        position?: string;
        sandbox?: string;
        theme?: string;
        name?: string;
      };
    }
  }
  interface Window {
    openKkiapayWidget: (config: Record<string, any>) => void;
    addKkiapayListener: (event: string, cb: (response: any) => void) => void;
    removeKkiapayListener: (event: string, cb: (response: any) => void) => void;
  }
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "1 500",
    priceNum: 1500,
    credits: 50,
    features: ["50 générations Image", "10 générations Vidéo", "Résolution Standard", "Support communautaire"],
  },
  {
    id: "creator",
    name: "Créateur",
    price: "5 000",
    priceNum: 5000,
    credits: 200,
    popular: true,
    features: ["200 générations Image", "50 générations Vidéo", "Résolution HD", "AFRIKA BOOST illimité", "Support prioritaire"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "15 000",
    priceNum: 15000,
    credits: 1000,
    features: ["1000 générations Image", "250 générations Vidéo", "Résolution 4K", "AFRIKA BOOST illimité", "API Access", "Support dédié 24/7"],
  },
];

const paymentMethods = [
  { name: "MTN MoMo", color: "#ffcc00" },
  { name: "Wave", color: "#1dc3e5" },
  { name: "Orange Money", color: "#ff6600" },
];

const KKIAPAY_KEY = "046751a99c664c3a1caf83a22a1f8068c568f24b";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");

  const handlePay = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setSelectedPlan(planId);

    if (typeof window.openKkiapayWidget === "function") {
      window.openKkiapayWidget({
        amount: plan.priceNum,
        key: KKIAPAY_KEY,
        sandbox: true,
        callback: window.location.origin + "/pricing",
        name: `AFRIKA DRIVE - ${plan.name}`,
        theme: "#e67e00",
      });

      const onSuccess = (response: any) => {
        console.log("KkiaPay success:", response);
        setPaymentStatus("success");
        window.removeKkiapayListener("success", onSuccess);
      };

      const onFailed = (response: any) => {
        console.log("KkiaPay failed:", response);
        setPaymentStatus("failed");
        window.removeKkiapayListener("failed", onFailed);
      };

      if (typeof window.addKkiapayListener === "function") {
        window.addKkiapayListener("success", onSuccess);
        window.addKkiapayListener("failed", onFailed);
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">
            <span className="text-gradient-primary">Recharge</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Hub Mobile Money</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Success / Failed Banner */}
        <AnimatePresence>
          {paymentStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`glass-card p-4 text-center text-sm font-medium ${
                paymentStatus === "success"
                  ? "text-green-400 border-green-400/20"
                  : "text-destructive border-destructive/20"
              }`}
            >
              {paymentStatus === "success"
                ? "✅ Paiement réussi ! Vos crédits ont été ajoutés."
                : "❌ Paiement échoué. Veuillez réessayer."}
              <button
                onClick={() => setPaymentStatus("idle")}
                className="ml-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 inline" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 space-y-4 relative ${
                plan.popular ? "glow-orange border-primary/20" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}

              <div>
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gradient-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">FCFA</span>
                </div>
                <p className="text-xs text-accent mt-1">{plan.credits} crédits AD</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePay(plan.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "btn-generate"
                    : "glass glass-hover text-foreground"
                }`}
              >
                Payer Maintenant
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Moyens de paiement acceptés</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((pm) => (
              <div
                key={pm.name}
                className="glass glass-hover rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: pm.color + "20", color: pm.color }}
                >
                  {pm.name.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground font-medium">{pm.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Paiement sécurisé via KkiaPay • Crédits activés instantanément
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
