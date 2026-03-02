import { motion } from "framer-motion";
import { GraduationCap, PenLine, Cpu, Download } from "lucide-react";

const steps = [
  {
    num: "1",
    icon: GraduationCap,
    title: "Tu te formes",
    desc: "Avant de créer, maîtrise les outils. Nos formations concrètes te guident pas à pas — de zéro jusqu'à ta première création pro. Clips, pubs, courts métrages, films — tu apprends en faisant.",
  },
  {
    num: "2",
    icon: PenLine,
    title: "Tu décris",
    desc: "Rentre ta vision, tes prompts et ton ambiance. Mets des mots sur l'image qui existe dans ta tête — le style, les couleurs, l'émotion que tu veux transmettre.",
  },
  {
    num: "3",
    icon: Cpu,
    title: "Tu génères",
    desc: "Accède aux meilleurs outils IA disponibles sur le marché, sélectionnés et testés pour toi. Un rendu cinématographique en quelques secondes, sans technique complexe.",
  },
  {
    num: "4",
    icon: Download,
    title: "Tu télécharges",
    desc: "Récupère tes assets en haute résolution, directement prêts pour ton montage vidéo. Prêt à publier, prêt à diffuser, prêt à impressionner.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-white/30 font-mono text-center mb-3"
        >
          Comment ça marche ?
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-8 sm:mt-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <step.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-lg mb-1.5 sm:mb-2 font-display">
                {step.num}. {step.title}
              </h3>
              <p className="text-white/40 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
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
