import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Choisis ton style", desc: "Image, vidéo, clip musical, lip-sync — sélectionne le type de création et le modèle IA." },
  { num: "02", title: "Génère ton contenu", desc: "Décris ce que tu veux en français. Notre IA traduit, optimise et génère en quelques secondes." },
  { num: "03", title: "Télécharge et publie", desc: "Récupère ton fichier HD et partage-le sur tes réseaux, dans ton clip ou ta campagne." },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            3 étapes. <span className="text-lime">C'est tout.</span>
          </h2>
        </motion.div>

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
              <span className="font-mono text-lime/30 text-xs tracking-widest">{step.num}</span>
              <h3 className="text-white font-bold text-lg mt-2 mb-2">{step.title}</h3>
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
