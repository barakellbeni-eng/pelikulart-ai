import { useState, useEffect, useRef } from "react";
import { Check, X, Coins } from "lucide-react";
import PaymentMarquee from "@/components/PaymentMarquee";
import { motion, AnimatePresence } from "framer-motion";
import { useCauris } from "@/hooks/useCauris";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initiateKkiapayPayment } from "@/utils/kkiapayIntegration";
import { launchConfetti, playSuccessSound } from "@/utils/celebrationEffects";

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

const packs = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "1 000",
    priceNum: 1000,
    cauris: 100,
    bonus: null,
    description: "Idéal pour tester",
    examples: ["~50 images basiques", "~2 vidéos courtes"],
  },
  {
    id: "createur",
    name: "Créateur",
    price: "2 500",
    priceNum: 2500,
    cauris: 300,
    bonus: "+20%",
    popular: true,
    description: "Le plus populaire",
    examples: ["~100 images HD", "~6 vidéos 5s"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "5 000",
    priceNum: 5000,
    cauris: 650,
    bonus: "+30%",
    description: "Pour les créateurs réguliers",
    examples: ["~200 images HD", "~13 vidéos 5s"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "10 000",
    priceNum: 10000,
    cauris: 1500,
    bonus: "+50%",
    description: "Production intensive",
    examples: ["~500 images HD", "~30 vidéos 5s"],
  },
  {
    id: "mega",
    name: "Mega",
    price: "25 000",
    priceNum: 25000,
    cauris: 4000,
    bonus: "+60%",
    description: "Volume maximal",
    examples: ["~1300 images HD", "~80 vidéos 5s"],
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const { balance, refetch } = useCauris();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [addedCauris, setAddedCauris] = useState(0);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    if (paymentStatus !== "success") {
      setDisplayBalance(balance);
    }
  }, [balance, paymentStatus]);

  const animateBalance = (from: number, added: number) => {
    const to = from + added;
    const duration = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBalance(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePay = async (pack: typeof packs[0]) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const paymentResult = await initiateKkiapayPayment({
        amount: pack.priceNum,
        email: user.email || "",
        name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Utilisateur",
        trainingName: `cauris.ai - ${pack.cauris} Cauris`,
      });

      if (!paymentResult.transactionId) {
        throw new Error("Transaction Kkiapay introuvable après paiement");
      }

      // Close KkiaPay widget if possible
      try {
        const kkWidget = document.querySelector('.kkiapay-overlay, .kkiapay-popup, [id*="kkiapay"]');
        if (kkWidget) (kkWidget as HTMLElement).style.display = "none";
      } catch {}

      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: {
          transaction_id: paymentResult.transactionId,
          amount: pack.priceNum,
        },
      });

      if (error || !data?.success) {
        console.error("Verify-payment failed", { error, data, paymentResult });
        setPaymentStatus("failed");
        return;
      }

      // 🎉 Celebration!
      const previousBalance = balance;
      const caurisAdded = data.cauris_added || pack.cauris;
      setAddedCauris(caurisAdded);
      setPaymentStatus("success");
      playSuccessSound();
      launchConfetti();
      animateBalance(previousBalance, caurisAdded);
      refetch();
    } catch (e) {
      console.error("Payment/verify error:", e);
      setPaymentStatus("failed");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Current Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Solde actuel</p>
              <div className="flex items-center gap-2">
                <motion.p
                  key={displayBalance}
                  initial={paymentStatus === "success" ? { scale: 1.3 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-2xl font-bold text-gradient-primary"
                >
                  {displayBalance} <span className="text-sm">Cauris</span>
                </motion.p>
                {paymentStatus === "success" && addedCauris > 0 && (
                  <motion.span
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="text-sm font-bold text-green-400"
                  >
                    +{addedCauris} 🐚
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

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
                ? `🎉 Paiement réussi ! +${addedCauris} Cauris ajoutés à votre solde.`
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

        {/* Packs Grid */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">Recharger en Cauris 🐚</h2>
          <p className="text-xs text-muted-foreground mb-4">Achetez des Cauris, générez des images et vidéos. Quand c'est fini, rechargez !</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {packs.map((pack, i) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card p-5 space-y-3 relative ${
                pack.popular ? "glow-orange border-primary/20" : ""
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Populaire
                </span>
              )}

              <div>
                <h3 className="font-semibold text-foreground text-sm">{pack.name}</h3>
                <p className="text-[10px] text-muted-foreground">{pack.description}</p>
              </div>

              <div>
                <span className="text-3xl font-bold text-gradient-primary">{pack.price}</span>
                <span className="text-xs text-muted-foreground ml-1">FCFA</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-accent">{pack.cauris}</span>
                <span className="text-xs text-muted-foreground">Cauris 🐚</span>
                {pack.bonus && (
                  <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
                    {pack.bonus}
                  </span>
                )}
              </div>

              <ul className="space-y-1">
                {pack.examples.map((ex) => (
                  <li key={ex} className="flex items-center gap-1.5 text-[11px] text-secondary-foreground">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    {ex}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePay(pack)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  pack.popular
                    ? "btn-generate"
                    : "glass glass-hover text-foreground"
                }`}
              >
                Acheter
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-center text-sm">Moyens de paiement acceptés</h3>
          <PaymentMarquee showAvailability />
          <p className="text-[10px] text-muted-foreground text-center">
            Paiement sécurisé via KkiaPay • Cauris activés instantanément
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
