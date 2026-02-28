import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Mail, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { initiateKkiapayPayment } from "@/utils/kkiapayIntegration";
import { sendPaymentConfirmationEmail } from "@/utils/googleScriptWebhook";
import paymentMethodsImg from "@/assets/payment-methods.png";

interface TrainingPlan {
  name: string;
  amount: number;
  [key: string]: unknown;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingPlan: TrainingPlan | null;
  onSuccess: (data: { email: string; name: string; trainingName: string }) => void;
}

const PaymentModal = ({ isOpen, onClose, trainingPlan, onSuccess }: PaymentModalProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "processing_payment" | "processing_email" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const DISCOUNT_CODE = "OFFRE60";
  const DISCOUNT_PERCENTAGE = 0.60;
  const originalPrice = trainingPlan?.amount || 0;
  const discountAmount = originalPrice * DISCOUNT_PERCENTAGE;
  const finalPrice = originalPrice - discountAmount;

  const formatPrice = (amount: number) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "" });
      setErrors({});
      setStatus("idle");
      setErrorMessage("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPaymentFlow = async () => {
    setStatus("processing_payment");
    setErrorMessage("");
    try {
      const paymentResult = await initiateKkiapayPayment({
        amount: finalPrice,
        email: formData.email,
        name: formData.name,
        trainingName: `${trainingPlan?.name} | PROMO: ${DISCOUNT_CODE} (-60%)`,
      });

      setStatus("processing_email");
      await sendPaymentConfirmationEmail({
        ...paymentResult,
        email: formData.email,
        name: formData.name,
        trainingName: `${trainingPlan?.name} (Offre -60%)`,
      });

      setStatus("success");
    } catch (error: unknown) {
      console.error("Payment flow interrupted:", error);
      setStatus("idle");
      const msg = error instanceof Error ? error.message : "";
      if (msg !== "User closed widget") {
        setErrorMessage("Le paiement n'a pas pu aboutir. Veuillez réessayer.");
        toast({ title: "Erreur de paiement", description: "La transaction n'a pas été finalisée.", variant: "destructive" });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) processPaymentFlow();
  };

  const handleCloseSuccess = () => {
    onSuccess({ email: formData.email, name: formData.name, trainingName: trainingPlan?.name || "" });
    onClose();
  };

  const isProcessing = status === "processing_payment" || status === "processing_email";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={!isProcessing && status !== "success" ? onClose : undefined}
          className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-dark-lighter sm:border border-white/10 sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        >
          {status === "success" ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-lime text-black h-full">
              <motion.div
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <CheckCircle2 size={48} className="text-lime" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-4">Paiement réussi !</h3>
              <p className="text-black/80 text-lg mb-8 font-medium max-w-[80%]">
                Consultez votre mail, vous avez reçu le lien d'accès à la formation.
              </p>
              <Button onClick={handleCloseSuccess} className="bg-black text-white hover:bg-black/80 w-full py-6 text-lg rounded-xl font-bold">
                Terminer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full w-full relative">
              <div className="bg-dark-lighter px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 z-10">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="text-lime" size={18} />
                  Finaliser l'inscription
                </h3>
                <button type="button" onClick={onClose} disabled={isProcessing} className="text-white/50 hover:text-white rounded-full transition-colors p-2 disabled:opacity-50">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-b border-green-500/20 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
                <div className="bg-green-500 text-black rounded-full p-1 shrink-0"><CheckCircle2 size={14} /></div>
                <div>
                  <p className="text-green-400 font-bold text-sm uppercase tracking-wide">Code {DISCOUNT_CODE} appliqué !</p>
                  <p className="text-green-400/70 text-xs">-60% de réduction immédiate.</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <span className="bg-lime text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">-60% OFF</span>
                  </div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide mb-1">Plan sélectionné</p>
                  <h4 className="font-bold text-white text-lg mb-4">{trainingPlan?.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-sm line-through">{formatPrice(originalPrice)} FCFA</span>
                    <span className="text-green-400 text-2xl font-bold">{formatPrice(finalPrice)} FCFA</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-500/80 text-xs mt-1">
                    <Sparkles size={14} />
                    <span>Vous économisez {formatPrice(discountAmount)} FCFA</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />{errorMessage}
                  </div>
                )}

                <div className="space-y-4 pb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2"><User size={16} className="text-lime" /> Nom complet</label>
                    <input type="text" placeholder="Votre nom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={isProcessing}
                      className={cn("w-full px-4 h-14 bg-white/5 border rounded-lg text-white text-base placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all disabled:opacity-50",
                        errors.name ? "border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-lime focus:ring-lime/20")} />
                    {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2"><Mail size={16} className="text-lime" /> Adresse Email</label>
                    <input type="email" inputMode="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isProcessing}
                      className={cn("w-full px-4 h-14 bg-white/5 border rounded-lg text-white text-base placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all disabled:opacity-50",
                        errors.email ? "border-red-500 focus:ring-red-500/20" : "border-white/10 focus:border-lime focus:ring-lime/20")} />
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-dark-lighter border-t border-white/10 shrink-0 mt-auto">
                <button type="submit" disabled={isProcessing}
                  className="w-full h-14 bg-[#ec4899] text-white font-bold text-lg rounded-xl hover:bg-[#db2777] transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 disabled:opacity-70">
                  {isProcessing ? <><Loader2 size={24} className="animate-spin" />{status === "processing_payment" ? "Paiement en cours..." : "Envoi de l'email..."}</> : `Payer ${formatPrice(finalPrice)} FCFA`}
                </button>
                <div className="mt-3">
                  <img src={paymentMethodsImg} alt="Moyens de paiement acceptés" className="h-6 w-auto mx-auto opacity-50" />
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
