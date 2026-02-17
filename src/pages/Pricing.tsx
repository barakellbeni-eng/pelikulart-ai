import { useState } from "react";
import { Check, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "1 500",
    credits: 50,
    features: ["50 générations Image", "10 générations Vidéo", "Résolution Standard", "Support communautaire"],
  },
  {
    id: "creator",
    name: "Créateur",
    price: "5 000",
    credits: 200,
    popular: true,
    features: ["200 générations Image", "50 générations Vidéo", "Résolution HD", "AFRIKA BOOST illimité", "Support prioritaire"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "15 000",
    credits: 1000,
    features: ["1000 générations Image", "250 générations Vidéo", "Résolution 4K", "AFRIKA BOOST illimité", "API Access", "Support dédié 24/7"],
  },
];

const paymentMethods = [
  { name: "MTN MoMo", color: "#ffcc00" },
  { name: "Wave", color: "#1dc3e5" },
  { name: "Orange Money", color: "#ff6600" },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayment(true);
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
                onClick={() => handleSelect(plan.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "btn-generate"
                    : "glass glass-hover text-foreground"
                }`}
              >
                Choisir
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
        </div>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-end md:items-center justify-center"
            onClick={() => setShowPayment(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">Confirmer le paiement</h2>
                <button onClick={() => setShowPayment(false)} className="text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="glass rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-3xl font-bold text-gradient-primary mt-1">
                  {plans.find((p) => p.id === selectedPlan)?.price} FCFA
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Numéro Mobile Money</p>
                <input
                  type="tel"
                  placeholder="+225 XX XX XX XX XX"
                  className="w-full glass rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button className="btn-generate w-full py-3 text-sm">
                Payer maintenant
              </button>

              <p className="text-[10px] text-muted-foreground text-center">
                Paiement sécurisé • Crédits activés instantanément
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pricing;
