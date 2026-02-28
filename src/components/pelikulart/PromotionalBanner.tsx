import { motion } from "framer-motion";
import { Sparkles, Gift } from "lucide-react";

const PromotionalBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white py-3 px-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <Gift size={18} className="shrink-0" />
        <p className="text-sm font-medium">
          <span className="font-bold">🎁 OFFRE SPÉCIALE :</span> -60% sur toutes les formations avec le code{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">OFFRE60</span>
        </p>
        <Sparkles size={14} className="shrink-0 opacity-70" />
      </div>
    </motion.div>
  );
};

export default PromotionalBanner;
