import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import paymentMethodsImg from "@/assets/payment-methods.png";
import type { LucideIcon } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  title: string;
  price: string;
  amount: number;
  icon: LucideIcon;
  description: string;
  tagline: string;
  highlight: boolean;
}

interface FloatingPricingBarProps {
  plans: Plan[];
  selectedPlanId: string;
  onSelectPlan: (plan: Plan) => void;
  onBuy: (plan: Plan) => void;
  isVisible: boolean;
}

const FloatingPricingBar = ({ plans, selectedPlanId, onSelectPlan, onBuy, isVisible }: FloatingPricingBarProps) => {
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 200 }}
          animate={{ y: 0 }}
          exit={{ y: 200 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 pb-[env(safe-area-inset-bottom,16px)]"
        >
          {/* Plan selector */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  plan.id === selectedPlanId
                    ? "bg-lime text-black"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>

          {/* Selected plan info + CTA */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-white font-bold text-sm">{selectedPlan.title}</p>
              <p className="text-lime font-bold text-lg">{selectedPlan.price} F</p>
            </div>
            <button
              onClick={() => onBuy(selectedPlan)}
              className="bg-[#ec4899] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:bg-[#db2777] transition-all"
            >
              PAYER
            </button>
          </div>

          <div className="mt-2">
            <img src={paymentMethodsImg} alt="Moyens de paiement acceptés" className="h-5 w-auto mx-auto opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingPricingBar;
