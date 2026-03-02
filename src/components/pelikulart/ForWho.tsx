import { motion } from "framer-motion";
import { Music, Film, Smartphone, Building2, Laptop, Megaphone } from "lucide-react";

const profiles = [
  { icon: Music, title: "Musiciens", desc: "Génère des clips vidéo, visualizers et covers sans budget studio." },
  { icon: Film, title: "Réalisateurs", desc: "Storyboards IA, effets visuels et bandes-annonces en minutes." },
  { icon: Smartphone, title: "Influenceurs", desc: "Contenu unique et viral pour TikTok, Reels et YouTube Shorts." },
  { icon: Building2, title: "Agences créatives", desc: "Production visuelle à l'échelle pour tes clients, sans sous-traitance." },
  { icon: Laptop, title: "Freelances", desc: "Multiplie tes services : ajoute la vidéo IA et l'image IA à ton offre." },
  { icon: Megaphone, title: "Marketeurs", desc: "Publicités et visuels de marque percutants, générés en un clic." },
];

const ForWho = () => {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Fait pour les <span className="text-lime">créateurs africains</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {profiles.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-6 hover:border-lime/20 transition-colors"
              >
                <Icon className="w-5 h-5 text-lime mb-3" />
                <h3 className="text-white font-semibold text-sm mb-1">{p.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ForWho;
