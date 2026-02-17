import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Sparkles, Download, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const afrikaBoostKeywords = [
  "Lumière du Sahel",
  "Textures Wax",
  "Afrofuturisme",
  "Coucher de soleil Serengeti",
  "Art Ndebele",
  "Masque Fang",
  "Kente doré",
  "Baobab mystique",
  "Dunes sahariennes",
  "Rythmes Djembé",
];

const Dashboard = () => {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleBoost = () => {
    const keyword = afrikaBoostKeywords[Math.floor(Math.random() * afrikaBoostKeywords.length)];
    setPrompt((prev) => (prev ? `${prev}, ${keyword}` : keyword));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-gradient-primary">AFRIKA</span>{" "}
            <span className="text-foreground">DRIVE</span>
          </h1>
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">250 AD</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-1.5 inline-flex gap-1"
        >
          <button
            onClick={() => setMode("image")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === "image"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Image className="w-4 h-4" />
            IMAGE
          </button>
          <button
            onClick={() => setMode("video")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === "video"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="w-4 h-4" />
            VIDÉO
          </button>
        </motion.div>

        {/* Model info */}
        <p className="text-xs text-muted-foreground">
          Modèle : <span className="text-accent font-medium">{mode === "image" ? "Nano Banana" : "Kling v2"}</span>
        </p>

        {/* Prompt Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 space-y-4"
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "image"
                ? "Décrivez l'image que vous souhaitez créer..."
                : "Décrivez la vidéo que vous souhaitez générer..."
            }
            className="min-h-[120px] bg-transparent border-0 resize-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBoost}
              className="flex items-center justify-center gap-2 glass glass-hover rounded-xl px-4 py-2.5 text-sm font-medium text-accent"
            >
              <Sparkles className="w-4 h-4" />
              AFRIKA BOOST
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="btn-generate animate-pulse-glow flex-1 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:animate-none"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>GÉNÉRER</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Render Zone */}
        <AnimatePresence>
          {(isGenerating || generated) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 space-y-4"
            >
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="skeleton-ad w-full aspect-[4/3] rounded-xl" />
                  <div className="flex gap-2">
                    <div className="skeleton-ad h-4 w-1/3 rounded" />
                    <div className="skeleton-ad h-4 w-1/4 rounded" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      {mode === "image" ? (
                        <Image className="w-16 h-16 text-primary/40 mx-auto" />
                      ) : (
                        <Video className="w-16 h-16 text-primary/40 mx-auto" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        Aperçu de votre {mode === "image" ? "image" : "vidéo"} générée
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate max-w-[60%]">
                      {prompt}
                    </p>
                    <button className="flex items-center gap-2 glass glass-hover rounded-xl px-4 py-2 text-sm font-medium text-primary">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
