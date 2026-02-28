import { useEffect } from "react";
import { motion } from "framer-motion";
import { Cookie, Settings, BarChart, ShoppingBag, Info, Check } from "lucide-react";

const cookieTypes = [
  { title: "Cookies Essentiels", icon: Check, color: "text-green-400", description: "Strictement nécessaires au fonctionnement du site." },
  { title: "Cookies Analytiques", icon: BarChart, color: "text-blue-400", description: "Nous aident à comprendre comment les visiteurs interagissent avec le site." },
  { title: "Cookies Marketing", icon: ShoppingBag, color: "text-purple-400", description: "Utilisés pour afficher des publicités pertinentes." },
];

const CookiePolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-black pt-24 md:pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Politique des <span className="text-lime">Cookies</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto">Transparence totale sur l'utilisation des technologies de suivi.</p>
          <div className="h-1 w-24 bg-lime mx-auto rounded-full mt-6" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-xl p-8 mb-10 border border-white/10">
          <div className="flex items-start gap-4">
            <Info className="text-lime shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Qu'est-ce qu'un cookie ?</h3>
              <p className="text-white/70 font-light leading-relaxed">Un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 mb-12">
          {cookieTypes.map((type, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-lime/30 transition-all">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-white/5 ${type.color}`}><type.icon size={24} /></div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{type.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Settings className="text-lime" size={24} />Gestion de vos préférences</h2>
            <div className="bg-white/5 border-l-4 border-lime p-6 rounded-r-lg">
              <p className="text-white/80 leading-relaxed">Vous pouvez gérer vos préférences via les paramètres de votre navigateur. Le rejet des cookies peut limiter certaines fonctionnalités.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Durée de conservation</h2>
            <p className="text-white/70 font-light leading-relaxed">Les cookies analytiques et marketing sont conservés pour une durée maximale de 13 mois.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
