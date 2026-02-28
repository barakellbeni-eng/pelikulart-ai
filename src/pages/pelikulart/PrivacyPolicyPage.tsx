import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, UserCheck, Mail } from "lucide-react";

const sections = [
  { title: "Collecte et Utilisation des Données", icon: Eye, content: "Nous collectons les informations que vous nous fournissez directement lorsque vous remplissez nos formulaires. Ces données sont utilisées exclusivement pour traiter vos demandes." },
  { title: "Cookies", icon: Server, content: "Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via votre navigateur." },
  { title: "Droits des Utilisateurs", icon: UserCheck, content: "Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles." },
  { title: "Partage avec des Tiers", icon: Shield, content: "Nous ne vendons ni ne louons vos informations. Nous partageons uniquement avec des prestataires de confiance pour l'exploitation du site." },
  { title: "Sécurité des Données", icon: Lock, content: "Vos données sont stockées dans des environnements sécurisés avec accès limité." },
  { title: "Conservation", icon: Server, content: "Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services." },
];

const PrivacyPolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black pt-24 md:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Politique de <span className="text-lime">Confidentialité</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto">La protection de vos données personnelles est au cœur de nos préoccupations.</p>
          <div className="h-1 w-24 bg-lime mx-auto rounded-full mt-6" />
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 hover:border-lime/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-lime/10 rounded-lg text-lime shrink-0"><section.icon size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
                  <p className="text-white/70 leading-relaxed font-light">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-lime/10 border border-lime/20 rounded-xl p-8 text-center mt-12">
            <div className="flex justify-center mb-4"><Mail size={32} className="text-lime" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Des questions ?</h3>
            <p className="text-white/70 mb-4">Contactez-nous pour toute question sur notre politique.</p>
            <a href="mailto:contact@barakellbeni.com" className="inline-block px-6 py-3 bg-lime text-black font-bold rounded-full hover:bg-lime/90 transition-colors">contact@barakellbeni.com</a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
