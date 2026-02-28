import { useEffect } from "react";
import { motion } from "framer-motion";

const LegalPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black pt-24 md:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Mentions <span className="text-lime">Légales</span></h1>
          <div className="h-1 w-24 bg-lime mx-auto rounded-full" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-10 text-white/80 font-light">
          {[
            { title: "1. Éditeur du site", content: <>Le site <strong>PELIKULART.AI</strong> est édité par <strong>Barakell Beni Creativity</strong>.<br/>Siège social : Cotonou, Bénin | Antenne : Abidjan, Côte d'Ivoire<br/>Tél : +225 07 99 33 23 38 / +229 01 96 40 29 20<br/>Email : <a href="mailto:contact@barakellbeni.com" className="text-lime hover:underline">contact@barakellbeni.com</a><br/>IFU : 0201910826918 | RCCM : RCCM_RB_COT_19_A_49128</> },
            { title: "2. Propriété intellectuelle", content: "Tout le contenu est protégé par les lois internationales sur le droit d'auteur. Toute reproduction est interdite sauf autorisation écrite." },
            { title: "3. Limitation de responsabilité", content: "Barakell Beni Creativity ne pourra être tenu responsable des dommages directs et indirects causés lors de l'accès au site." },
            { title: "4. Droit applicable", content: "Tout litige est soumis au droit de la République du Bénin. Juridiction exclusive : tribunaux de Cotonou." },
            { title: "5. Modification", content: "Barakell Beni Creativity se réserve le droit de modifier les présentes mentions à tout moment." },
          ].map((section, i) => (
            <section key={i} className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold text-white border-l-4 border-lime pl-4">{section.title}</h2>
              <div className="bg-white/5 p-6 rounded-lg"><p className="leading-relaxed">{section.content}</p></div>
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;
