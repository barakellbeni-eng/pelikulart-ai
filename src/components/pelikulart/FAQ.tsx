import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "C'est quoi Pelikulart AI ?",
    answer: "La première plateforme IA créative pour l'Afrique francophone. Génère des images, vidéos et musique — 100% en français, payable en FCFA via Mobile Money.",
  },
  {
    question: "Quels moyens de paiement ?",
    answer: "Wave, Orange Money, MTN MoMo, Moov Money pour l'Afrique de l'Ouest. Visa et Mastercard acceptées pour le reste du monde.",
  },
  {
    question: "Mes crédits expirent-ils ?",
    answer: "Non, jamais. Les Cauris que tu achètes restent sur ton compte indéfiniment — même si tu ne te connectes pas pendant des mois.",
  },
  {
    question: "Combien coûte une génération ?",
    answer: "Image HD : ~1 Cauri. Vidéo 5s : ~10 Cauris. Audio 30s : ~8 Cauris. Les coûts exacts dépendent du modèle choisi.",
  },
  {
    question: "Puis-je utiliser mes créations commercialement ?",
    answer: "Oui. Tout ce que tu crées t'appartient : campagnes pub, clips, posts commerciaux, formations — sans restriction.",
  },
  {
    question: "Comment contacter le support ?",
    answer: "Via WhatsApp — réponse en moins de 2h pendant les heures ouvrées (8h-20h). Ou par email à support@pelikulart.ai.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-12">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime opacity-80 mb-4">
            // FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            Questions <span className="text-lime">fréquentes</span>
          </h2>
        </div>

        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full py-5 flex items-center justify-between gap-4 text-left group"
                >
                  <span className={`text-sm sm:text-[15px] font-medium transition-colors ${isOpen ? "text-lime" : "text-white group-hover:text-lime"}`}>
                    {faq.question}
                  </span>
                  <span className={`text-lime text-lg transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-white/50 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
