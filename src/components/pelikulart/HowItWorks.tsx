import { motion } from "framer-motion";
import { PenLine, Cpu, Download } from "lucide-react";

const steps = [
  { num: "1", icon: PenLine, title: "Décris", desc: "Rentre ta vision, tes prompts et ton ambiance. Mets des mots sur l'image qui existe dans ta tête." },
  { num: "2", icon: Cpu, title: "Génère", desc: "Notre moteur IA calcule et produit le rendu visuel avec une qualité cinématographique en quelques secondes." },
  { num: "3", icon: Download, title: "Télécharge", desc: "Récupère tes assets en haute résolution (4K) directement prêts pour ton montage vidéo." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 font-display">
                {step.num}. {step.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 -right-4 text-white/10 text-2xl">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
