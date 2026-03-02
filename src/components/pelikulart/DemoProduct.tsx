import { motion } from "framer-motion";
import { Languages, Smartphone, Coins, Zap, Shield, Globe } from "lucide-react";

const features = [
  { icon: Languages, label: "Génération en français" },
  { icon: Smartphone, label: "Paiement Mobile Money" },
  { icon: Coins, label: "Prix en FCFA" },
  { icon: Zap, label: "Résultats en secondes" },
  { icon: Shield, label: "Données sécurisées" },
  { icon: Globe, label: "Accessible partout en Afrique" },
];

const DemoProduct = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Interface mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#111] shadow-2xl shadow-black/60">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0c0c0c] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/5 rounded-md px-3 py-1 text-[10px] text-white/30 font-mono text-center">
                    pelikulart.ai/studio
                  </div>
                </div>
              </div>

              {/* Interface preview via iframe */}
              <div className="aspect-[16/10] w-full bg-[#0a0a0a] relative overflow-hidden">
                <iframe
                  src="https://app.videas.fr/embed/media/2a758df7-947b-4516-a5b8-4bef8b85b428/?autoplay=1&loop=1&controls=0&title=false&logo=false"
                  title="Pelikulart AI Studio Demo"
                  className="w-full h-full border-0 pointer-events-none"
                  allow="autoplay"
                  tabIndex={-1}
                />
              </div>
            </div>

            {/* Glow behind mockup */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-3xl"
              style={{ background: "radial-gradient(ellipse at center, hsl(23 100% 50% / 0.2), transparent 70%)" }}
            />
          </motion.div>

          {/* Right — Features list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-lime/20 group-hover:bg-lime/5 transition-colors">
                    <f.icon className="w-4.5 h-4.5 text-lime" />
                  </div>
                  <span className="text-sm text-white/70 font-label">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoProduct;
