import { useState } from "react";
import { Check, X, Smartphone, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCauris } from "@/hooks/useCauris";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const paymentMethods = [
  { name: "MTN MoMo", color: "#ffcc00" },
  { name: "Wave", color: "#1dc3e5" },
  { name: "Orange Money", color: "#ff6600" },
];

const KKIAPAY_KEY = "046751a99c664c3a1caf83a22a1f8068c568f24b";

const Pricing = () => {
  const { user } = useAuth();
  const { balance, refetch } = useCauris();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");

  const handlePay = (pack: typeof packs[0]) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (typeof window.openKkiapayWidget === "function") {
      window.openKkiapayWidget({
        amount: pack.priceNum,
        key: KKIAPAY_KEY,
        sandbox: false,
        callback: window.location.origin + "/pricing",
        name: `AFRIKA DRIVE - ${pack.cauris} Cauris`,
        theme: "#e67e00",
      });

      const onSuccess = async (response: any) => {
        console.log("KkiaPay success:", response);
        // Add cauris to user's balance
        const { error } = await supabase.rpc("add_cauris", {
          p_user_id: user.id,
          p_amount: pack.cauris,
        });
        if (!error) {
          setPaymentStatus("success");
          refetch();
        } else {
          setPaymentStatus("failed");
        }
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
              <p className="text-2xl font-bold text-gradient-primary">{balance} <span className="text-sm">Cauris</span></p>
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
                ? "✅ Paiement réussi ! Vos Cauris ont été ajoutés."
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
            Paiement sécurisé via KkiaPay • Cauris activés instantanément
          </p>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
