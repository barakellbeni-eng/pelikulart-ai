import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const DemoProduct = () => {
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
          <Sparkles className="w-5 h-5 text-lime" />
          <span className="text-xs uppercase tracking-[0.3em] text-lime/80 font-mono">La solution</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white/70 leading-relaxed"
        >
          Pelikulart te forme et met à ta disposition les outils pour créer tes pubs, clips, courts métrages et films —{" "}
          <span className="text-lime">sans abonnement mensuel ou annuel</span>, payable directement en FCFA via Mobile Money.
        </motion.p>
      </div>
    </section>
  );
};

export default DemoProduct;
