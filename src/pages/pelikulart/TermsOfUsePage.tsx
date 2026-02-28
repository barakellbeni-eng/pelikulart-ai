import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, Copyright, Scale, Power } from "lucide-react";

const terms = [
  { title: "1. Acceptation des Conditions", icon: CheckCircle, content: "En accédant à ce site, vous acceptez d'être lié par les présentes conditions d'utilisation." },
  { title: "2. Utilisation Autorisée", icon: FileText, content: "Vous êtes autorisé à consulter le contenu pour votre usage personnel et non commercial uniquement." },
  { title: "3. Restrictions d'Usage", icon: AlertTriangle, content: ["Modifier ou copier le matériel", "Utiliser le matériel à des fins commerciales", "Tenter de décompiler tout logiciel", "Supprimer les mentions de propriété", "Transférer le matériel à un tiers"] },
  { title: "4. Propriété Intellectuelle", icon: Copyright, content: "Tout le contenu est la propriété exclusive de Barakell Beni Creativity." },
  { title: "5. Limitation de Responsabilité", icon: Scale, content: "Les documents sont fournis 'tels quels'. Aucune garantie expresse ou implicite n'est donnée." },
  { title: "6. Modifications", icon: Power, content: "Nous nous réservons le droit de réviser ces conditions à tout moment sans préavis." },
];

const TermsOfUsePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black pt-24 md:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Conditions <span className="text-lime">d'Utilisation</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto">Veuillez lire attentivement les conditions régissant l'utilisation de nos services.</p>
          <div className="h-1 w-24 bg-lime mx-auto rounded-full mt-6" />
        </motion.div>

        <div className="space-y-6">
          {terms.map((term, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 rounded-full blur-[40px] group-hover:bg-lime/10 transition-colors pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <term.icon className="text-lime" size={24} />
                  <h2 className="text-xl font-bold text-white">{term.title}</h2>
                </div>
                {Array.isArray(term.content) ? (
                  <ul className="list-disc pl-5 space-y-2 text-white/70 font-light">{term.content.map((item, i) => <li key={i}>{item}</li>)}</ul>
                ) : (<p className="text-white/70 leading-relaxed font-light">{term.content}</p>)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center text-white/40 text-sm">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
