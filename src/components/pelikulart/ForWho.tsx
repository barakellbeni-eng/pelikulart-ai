import { motion } from "framer-motion";

const profiles = [
  { icon: "🎵", title: "Musiciens", desc: "Génère des clips vidéo, visualizers et covers sans budget studio." },
  { icon: "🎬", title: "Réalisateurs", desc: "Storyboards IA, effets visuels et bandes-annonces en minutes." },
  { icon: "📱", title: "Influenceurs", desc: "Contenu unique et viral pour TikTok, Reels et YouTube Shorts." },
  { icon: "🏢", title: "Agences créatives", desc: "Production visuelle à l'échelle pour tes clients, sans sous-traitance." },
  { icon: "💻", title: "Freelances", desc: "Multiplie tes services : ajoute la vidéo IA et l'image IA à ton offre." },
  { icon: "📢", title: "Marketeurs", desc: "Publicités et visuels de marque percutants, générés en un clic." },
];

const ForWho = () => {
  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime/70 mb-4">// Pour qui ?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Fait pour les <span className="text-lime">créateurs africains</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {profiles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:border-lime/20 transition-colors"
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWho;
