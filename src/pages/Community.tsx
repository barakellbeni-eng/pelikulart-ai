import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Download, Heart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityImage {
  id: string;
  url: string;
  prompt: string;
  creator: string;
  created_at: string;
}

const Community = () => {
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CommunityImage | null>(null);

  useEffect(() => {
    const fetchPublic = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("id, image_url, prompt, creator_name, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setImages(
          data.map((g: any) => ({
            id: g.id,
            url: g.image_url,
            prompt: g.prompt,
            creator: g.creator_name || "Artiste",
            created_at: g.created_at,
          }))
        );
      }
      setLoading(false);
    };
    fetchPublic();
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `afrikaart-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-foreground">Communauté</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {images.length} créations partagées par les artistes
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Aucune création partagée pour le moment
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Créez des images dans le Studio et partagez-les avec la communauté !
              </p>
            </div>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(img)}
                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative"
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="w-full object-cover rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                    <p className="text-[10px] text-white/80 line-clamp-2">{img.prompt}</p>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-white/60" />
                      <span className="text-[10px] text-white/60 font-medium">{img.creator}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl max-h-[90vh] flex flex-col items-center gap-4"
            >
              <img
                src={selected.url}
                alt={selected.prompt}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
              <div className="space-y-2 text-center max-w-md">
                <p className="text-sm text-white/80">{selected.prompt}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-xs text-white/50">{selected.creator}</span>
                </div>
                <button
                  onClick={() => handleDownload(selected.url)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
