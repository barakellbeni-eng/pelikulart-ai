import { useState } from "react";
import { X, Download, Calendar, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryItem {
  id: string;
  type: "image" | "video";
  prompt: string;
  date: string;
  model: string;
  height: number;
}

const mockGallery: GalleryItem[] = [
  { id: "1", type: "image", prompt: "Guerrier Maasaï en armure afrofuturiste, Lumière du Sahel", date: "2025-01-15", model: "Nano", height: 280 },
  { id: "2", type: "video", prompt: "Danse de masques Dogon en mouvement cinématique", date: "2025-01-14", model: "Kling", height: 200 },
  { id: "3", type: "image", prompt: "Marché de Dakar au coucher du soleil, textures Wax", date: "2025-01-13", model: "Nano", height: 320 },
  { id: "4", type: "image", prompt: "Ville Lagos cyberpunk 2080, néons Afrofuturisme", date: "2025-01-12", model: "Nano", height: 240 },
  { id: "5", type: "video", prompt: "Baobab ancestral avec aurore boréale africaine", date: "2025-01-11", model: "Kling", height: 300 },
  { id: "6", type: "image", prompt: "Portrait reine Ashanti en or et Kente, Art contemporain", date: "2025-01-10", model: "Nano", height: 260 },
];

const Gallery = () => {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">
            <span className="text-gradient-gold">Galerie</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{mockGallery.length} créations</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {mockGallery.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(item)}
              className="glass-card overflow-hidden cursor-pointer group break-inside-avoid"
            >
              <div
                className="w-full bg-gradient-to-br from-primary/10 via-accent/5 to-muted flex items-center justify-center"
                style={{ height: item.height }}
              >
                <span className="text-2xl opacity-30">
                  {item.type === "image" ? "🎨" : "🎬"}
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.model}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Détails</h2>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="w-full bg-gradient-to-br from-primary/10 via-accent/5 to-muted rounded-xl flex items-center justify-center"
                style={{ height: 300 }}
              >
                <span className="text-4xl opacity-30">
                  {selected.type === "image" ? "🎨" : "🎬"}
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-foreground">{selected.prompt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {selected.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> {selected.model}
                  </span>
                </div>
                <button className="btn-generate w-full flex items-center justify-center gap-2 text-sm py-3">
                  <Download className="w-4 h-4" />
                  Télécharger HD
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
