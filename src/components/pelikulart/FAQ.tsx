import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqItems = [
  {
    question: "En quoi consiste exactement un clip IA ?",
    answer: "C'est une production vidéo générée ou augmentée par l'intelligence artificielle. Nous utilisons des algorithmes avancés pour créer des visuels uniques, des transitions impossibles à filmer traditionnellement et des esthétiques sur-mesure, le tout synchronisé parfaitement avec votre musique."
  },
  {
    question: "Est-ce que je peux utiliser mon propre son ou morceau ?",
    answer: "Absolument. Votre musique est le cœur du projet. Nous analysons le rythme, les paroles et l'ambiance de votre piste audio pour générer des images qui réagissent et s'adaptent parfaitement à votre création sonore."
  },
  {
    question: "Comment fonctionne le processus de création ?",
    answer: "Tout commence par un échange pour comprendre votre vision. Ensuite, nous créons un moodboard et des premiers tests visuels. Une fois la direction validée, nous produisons le clip complet. Vous avez des étapes de validation pour garantir que le résultat correspond à vos attentes."
  },
  {
    question: "Est-ce que je peux participer à la direction artistique ?",
    answer: "Oui, c'est une collaboration. Vous pouvez nous fournir des références, des images, des thèmes ou des styles précis. Plus vous partagez votre univers, plus l'IA pourra générer un résultat qui vous ressemble."
  },
  {
    question: "Est-ce qu'on peut inclure mon visage ou mon personnage ?",
    answer: "Oui, grâce à des techniques d'entraînement de modèles (LoRA/Dreambooth), nous pouvons intégrer votre visage ou une identité spécifique dans les générations vidéo."
  },
  {
    question: "Quelle est la différence entre un reel, un clip et un court-métrage IA ?",
    answer: "La durée et la narration. Un reel (15-60s) est un format court pour les réseaux sociaux. Un clip (2-4min) accompagne un morceau complet. Un court-métrage se concentre sur une histoire scénarisée."
  },
  {
    question: "Est-ce que je peux apprendre à le faire moi-même ?",
    answer: "Tout à fait. Nous proposons des formations et masterclasses pour vous apprendre à maîtriser les outils d'IA générative vidéo."
  },
  {
    question: "Comment puis-je commencer ?",
    answer: "Il suffit de nous contacter via le formulaire de devis. Décrivez brièvement votre projet, et nous reviendrons vers vous pour discuter des prochaines étapes."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-10 md:py-24 bg-black relative">
      <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-lime/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-lime/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-6xl font-bold mb-4 tracking-tighter">
            <span className="text-white">QUESTIONS</span>{" "}
            <span className="text-lime">FRÉQUENTES</span>
          </h2>
          <p className="text-lg md:text-xl text-white/70">
            Tout ce que vous devez savoir sur la création vidéo par IA
          </p>
        </motion.div>

        <div className="space-y-3 md:space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="border border-white/10 rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm w-full"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 py-4 md:px-6 md:py-5 flex items-center justify-between text-left group transition-colors duration-300 hover:bg-white/5 min-h-[44px]"
              >
                <span className={`text-base md:text-xl font-bold transition-colors duration-300 pr-4 ${openIndex === index ? "text-lime" : "text-white group-hover:text-lime"}`}>
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <Plus size={20} className={`md:w-6 md:h-6 ${openIndex === index ? "text-lime" : "text-white/50"}`} />
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
                    <div className="px-4 pb-4 md:px-6 md:pb-6 text-white/70 text-sm md:text-lg leading-relaxed font-light border-t border-white/5 pt-4">
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

export default FAQ;
