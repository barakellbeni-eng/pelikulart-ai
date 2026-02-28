import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NewModel {
  name: string;
  brand: string;
  tag: string;
  description: string;
  icon: string;
}

const newModels: NewModel[] = [
  { name: "Nano Banana Pro", brand: "Google", tag: "NOUVEAU", description: "Gemini 3 Pro Image — rapide, polyvalent, multi-ratio", icon: "◆" },
  { name: "Imagen 4 Ultra", brand: "Google", tag: "NOUVEAU", description: "Qualité maximale, détails extrêmes par Google", icon: "◈" },
  { name: "Seedream v4.5", brand: "ByteDance", tag: "NOUVEAU", description: "Ultra réaliste en 2-3s, dernière génération", icon: "◈" },
  { name: "Kling 2.1", brand: "Kling", tag: "VIDÉO", description: "Génération vidéo cinématique de nouvelle génération", icon: "▶" },
  { name: "FLUX Kontext Max", brand: "FLUX", tag: "ÉDITION", description: "Typographie améliorée et édition contextuelle", icon: "◫" },
  { name: "Veo 3", brand: "Google", tag: "VIDÉO", description: "Vidéo IA de Google avec audio synchronisé", icon: "▶" },
];

const NewModelsSection = () => {
  return (
    <section className="relative w-full bg-black py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-lime" />
          <span className="text-xs font-bold uppercase tracking-widest text-lime">
            Quoi de neuf ?
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Nouvelles IA disponibles
        </h2>
        <p className="text-white/40 text-sm mb-8 max-w-lg">
          Les derniers modèles d'intelligence artificielle sont désormais accessibles sur Pelikulart AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {newModels.map((model, i) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5 opacity-60">
                  {model.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm truncate">
                      {model.name}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime/10 text-lime">
                      {model.tag}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs mb-1">{model.brand}</p>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2">
                    {model.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewModelsSection;
