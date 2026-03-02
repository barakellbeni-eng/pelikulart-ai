import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const QuoteManifesto = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-xs uppercase tracking-[0.3em] text-red-400/80 font-mono">Le problème</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white/70 leading-relaxed"
        >
          Trop d'outils où l'on se perd, aucune formation concrète, des abonnements mensuels en dollars qui saignent le portefeuille — et tout ça{" "}
          <span className="text-red-400">sans Mobile Money.</span>
        </motion.p>
      </div>
    </section>
  );
};

export default QuoteManifesto;
