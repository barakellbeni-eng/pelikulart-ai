import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Combien de temps ai-je accès aux vidéos de formation ?",
    answer:
      "L'accès aux vidéos est illimité et à vie pour toutes les offres. Tu apprends à ton rythme et tu peux revoir les leçons quand tu veux, même dans un an.",
  },
  {
    question: "Pourquoi le support et les mises à jour sont-ils limités ?",
    answer:
      "L'IA évolue chaque semaine. Pour te garantir des astuces toujours fonctionnelles et un accompagnement de qualité, le support et la veille technologique sont limités (1 an pour le Pack PRO) afin de rester concentrés sur les outils les plus récents.",
  },
  {
    question: "Les outils IA utilisés sont-ils payants ?",
    answer:
      "La plupart des outils (Kling, Runway, ElevenLabs) offrent des versions gratuites pour tester. Cependant, pour un rendu professionnel sans logo et en haute définition, il faut prévoir un petit budget d'abonnement (environ 10$ à 15$).",
  },
  {
    question: "Le Coaching Elite garantit-il des résultats ?",
    answer:
      "C'est un suivi intensif de 3 mois avec Barakell Beni. Si tu appliques ma méthode et mes stratégies de monétisation sur tes projets, tu auras toutes les clés pour devenir un créateur IA rentable.",
  },
  {
    question: "Ai-je besoin d'un ordinateur puissant ?",
    answer:
      "Non. Tout se passe sur internet (le Cloud). Un ordinateur simple ou même une bonne tablette avec une connexion internet stable suffisent pour générer des contenus.",
  },
];

const TrainingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-white/5">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            QUESTIONS <span className="text-primary">FRÉQUENTES</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tout ce que vous devez savoir avant de rejoindre la formation.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-xl transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? "bg-white/10 shadow-lg shadow-primary/5"
                  : "bg-white/5 hover:bg-white/[0.08]"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span
                  className={`text-base md:text-lg font-bold transition-colors ${
                    openIndex === index
                      ? "text-primary"
                      : "text-foreground group-hover:text-foreground/90"
                  }`}
                >
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 ml-4 ${
                    openIndex === index ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed mt-2 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainingFAQ;
