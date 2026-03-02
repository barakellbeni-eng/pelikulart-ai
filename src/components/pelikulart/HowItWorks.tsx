import { motion } from "framer-motion";
import { UserPlus, GraduationCap, Wand2, Coins } from "lucide-react";

const steps = [
  { num: "1", icon: UserPlus, title: "Inscris-toi" },
  { num: "2", icon: GraduationCap, title: "Forme-toi" },
  { num: "3", icon: Wand2, title: "Crée" },
  { num: "4", icon: Coins, title: "Paie en FCFA" },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-white/30 font-mono">Comment ça marche</span>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-full px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-lime" />
                </div>
                <span className="text-white font-semibold text-sm font-display">{step.title}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="text-white/15 text-lg hidden md:block">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
