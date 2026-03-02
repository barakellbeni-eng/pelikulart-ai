import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { playClickSound } from "@/utils/clickSound";

const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-lime/5 to-transparent border border-lime/10 rounded-2xl p-10 md:p-16"
        >
           <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4 font-display">
             Prêt à créer ?
           </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto mb-3">
            Inscris-toi gratuitement et reçois <span className="text-lime font-bold">50 Cauris offerts</span> pour tester le studio IA.
          </p>
          <p className="text-white/30 text-xs mb-8">
            Aucune carte bancaire requise. Paiement Mobile Money.
          </p>
          <Link
            to="/auth"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 px-8 py-4 bg-lime text-white rounded-pill font-label text-lg tracking-wider uppercase hover:bg-lime/90 transition-all glow-accent"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
