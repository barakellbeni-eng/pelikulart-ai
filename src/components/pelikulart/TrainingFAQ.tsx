import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqItems = [
  { question: "Ai-je besoin de compétences techniques ?", answer: "Non. La formation est conçue pour les débutants comme les créateurs confirmés. Tout est expliqué étape par étape." },
  { question: "Combien de temps dure la formation ?", answer: "3 heures de contenu vidéo intensif, à suivre à votre rythme. L'accès est illimité et à vie." },
  { question: "Comment accéder à la formation après paiement ?", answer: "Vous recevez instantanément un code d'accès par email et un lien vers la plateforme de formation." },
  { question: "Puis-je payer par Mobile Money ?", answer: "Oui ! Nous acceptons MTN MoMo, Orange Money, Wave et les cartes bancaires via Kkiapay." },
  { question: "Y a-t-il un support après la formation ?", answer: "Oui, selon votre plan : groupe WhatsApp d'entraide (Starter), support réactif (Pro), ou coaching personnalisé (Elite)." },
];

const TrainingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        Questions <span className="text-lime">fréquentes</span>
      </h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div key={index} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-4 py-4 flex items-center justify-between text-left group hover:bg-white/5 transition-colors"
            >
              <span className={`font-bold text-sm md:text-base pr-4 ${openIndex === index ? "text-lime" : "text-white group-hover:text-lime"}`}>
                {item.question}
              </span>
              <motion.div animate={{ rotate: openIndex === index ? 45 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
                <Plus size={18} className={openIndex === index ? "text-lime" : "text-white/50"} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="px-4 pb-4 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingFAQ;
