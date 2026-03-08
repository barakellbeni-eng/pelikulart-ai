import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Loader2, Camera, GripVertical, Download, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import MediaPickerModal from "@/components/MediaPickerModal";

const MULTIPLAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-multiplan`;

const PLAN_TYPES = [
  { id: "close-up", label: "Close-up", emoji: "🔍" },
  { id: "macro", label: "Macro", emoji: "🔬" },
  { id: "serre", label: "Serré", emoji: "📷" },
  { id: "americain", label: "Américain", emoji: "🎬" },
  { id: "large", label: "Large", emoji: "🌄" },
  { id: "tres-large", label: "Très large", emoji: "🏔️" },
  { id: "plongee", label: "Plongée", emoji: "🦅" },
  { id: "contre-plongee", label: "Contre-plongée", emoji: "🐜" },
] as const;

type PlanTypeId = typeof PLAN_TYPES[number]["id"];

const MultiPlan = () => {
  const { user } = useAuth();
  const { refetch: refreshBalance } = useCauris();

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTypeId>("close-up");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<{ url: string; job_id: string }[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [finalResult, setFinalResult] = useState<{ url: string; job_id: string } | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const variationsRef = useRef<HTMLDivElement>(null);
  const planButtonsRef = useRef<HTMLDivElement>(null);
  const finalResultRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToElement = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
  };

  const handleMediaSelect = useCallback((url: string, _item?: any) => {
    setSourceImage(url);
    setVariations([]);
    setSelectedVariation(null);
    setFinalResult(null);
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) {
      setSourceImage(imageUrl);
      setVariations([]);
      setSelectedVariation(null);
      setFinalResult(null);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceImage(reader.result as string);
        setVariations([]);
        setSelectedVariation(null);
        setFinalResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleVary = async () => {
    if (!sourceImage || !user || isGenerating) return;
    setIsGenerating(true);
    setVariations([]);
    setSelectedVariation(null);
    setFinalResult(null);

    // Scroll to loading zone
    setTimeout(() => variationsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const resp = await fetch(MULTIPLAN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          image_url: sourceImage,
          plan_type: selectedPlan,
          mode: "vary",
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const data = await resp.json();
      setVariations(data.images || []);
      setGenerationCount((c) => c + 1);
      refreshBalance();
      toast.success("4 variations générées !");

      // Auto-scroll to plan buttons after variations appear
      setTimeout(() => planButtonsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanClick = async (index: number) => {
    if (!sourceImage || !user || isGeneratingPlan) return;
    setSelectedVariation(index);
    setIsGeneratingPlan(true);
    setFinalResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const resp = await fetch(MULTIPLAN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          image_url: variations[index].url,
          plan_type: selectedPlan,
          mode: "single",
          plan_index: index + 1,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const data = await resp.json();
      if (data.images?.[0]) {
        setFinalResult(data.images[0]);
        refreshBalance();
        toast.success("Plan final généré et sauvegardé !");
        // Auto-scroll to final result
        scrollToElement(finalResultRef);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pelikulart-${name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch { toast.error("Erreur lors du téléchargement"); }
  };

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">
            <span className="text-gradient-gold">Multi-Plan</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Générez des variations cinématiques de votre image sous différents angles
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative"
          layout
        >
          <AnimatePresence mode="wait">
            {sourceImage ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative rounded-2xl overflow-hidden border border-border bg-card"
              >
                <img src={sourceImage} alt="Source" className="w-full max-h-[280px] object-contain bg-black/20" />
                <button
                  onClick={() => { setSourceImage(null); setVariations([]); setSelectedVariation(null); setFinalResult(null); }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground hover:bg-background transition-colors"
                >
                  Changer l'image
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMediaPicker(true)}
                className="w-full border-2 border-dashed border-border rounded-2xl py-16 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                <Upload className="w-10 h-10" />
                <span className="text-sm font-medium">Ajouter une image source</span>
                <span className="text-xs text-muted-foreground/60">Cliquez ou glissez-déposez une image</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Plan type selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Type de plan
          </label>
          <div className="flex flex-wrap gap-2">
            {PLAN_TYPES.map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedPlan === plan.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
                whileHover={{ scale: selectedPlan === plan.id ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{plan.emoji}</span>
                {plan.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={handleVary}
          disabled={!sourceImage || isGenerating || !user}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          whileHover={!isGenerating && sourceImage ? { scale: 1.01 } : {}}
          whileTap={!isGenerating && sourceImage ? { scale: 0.98 } : {}}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              {generationCount > 0 ? <RotateCcw className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              {generationCount > 0 ? "Relancer les plans" : "Varier les plans"}
              <span className="text-sm opacity-70 ml-1">· 3 cauris</span>
            </>
          )}
        </motion.button>

        {/* 4 variations grid */}
        <div ref={variationsRef}>
          <AnimatePresence>
            {(variations.length > 0 || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="space-y-3"
              >
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                  Variations générées
                  {isGenerating && <span className="text-primary text-[9px] animate-pulse">en cours...</span>}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {isGenerating
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={`loading-${i}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="aspect-square rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-2 border border-border/50"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          >
                            <Loader2 className="w-6 h-6 text-primary/50" />
                          </motion.div>
                          <span className="text-[10px] text-muted-foreground/40">Plan {i + 1}</span>
                        </motion.div>
                      ))
                    : variations.map((v, i) => (
                        <motion.div
                          key={v.job_id || i}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: i * 0.12, type: "spring", damping: 15, stiffness: 200 }}
                          className="relative group"
                        >
                          <img
                            src={v.url}
                            alt={`Variation ${i + 1}`}
                            className="w-full aspect-square object-cover rounded-2xl border border-border transition-all group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/x-gallery-image", v.url);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-[10px] font-bold text-foreground">
                            #{i + 1}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDownload(v.url, `variation-${i + 1}`)}
                              className="w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-3.5 h-3.5 text-foreground" />
                            </button>
                            <GripVertical className="w-4 h-4 text-foreground/60" />
                          </div>
                        </motion.div>
                      ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan buttons */}
        <div ref={planButtonsRef} className="space-y-3">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Sélectionnez un plan à affiner
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => {
              const idx = n - 1;
              const enabled = variations.length > 0 && !!variations[idx];
              const isActive = selectedVariation === idx;

              return (
                <motion.button
                  key={n}
                  onClick={() => enabled && handlePlanClick(idx)}
                  disabled={!enabled || isGeneratingPlan}
                  className={`py-4 rounded-xl text-sm font-bold transition-all ${
                    isActive && isGeneratingPlan
                      ? "bg-primary/20 text-primary"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : enabled
                          ? "bg-card border border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                          : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                  }`}
                  whileHover={enabled && !isGeneratingPlan ? { scale: 1.04, y: -2 } : {}}
                  whileTap={enabled && !isGeneratingPlan ? { scale: 0.96 } : {}}
                  animate={
                    isActive && isGeneratingPlan
                      ? { opacity: [0.5, 1, 0.5] }
                      : enabled
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0.4, scale: 1 }
                  }
                  transition={
                    isActive && isGeneratingPlan
                      ? { repeat: Infinity, duration: 1.2 }
                      : { duration: 0.2 }
                  }
                >
                  {isActive && isGeneratingPlan ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    `Plan ${n}`
                  )}
                </motion.button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            Chaque plan coûte 2 cauris · Les images sont glissables vers d'autres outils
          </p>
        </div>

        {/* Final result */}
        <div ref={finalResultRef}>
          <AnimatePresence>
            {finalResult && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 18, stiffness: 180 }}
                className="space-y-3"
              >
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                  ✨ Résultat final — sauvegardé dans Mes Générations
                </label>
                <div className="rounded-2xl overflow-hidden border-2 border-primary/40 bg-card shadow-2xl shadow-primary/10">
                  <img
                    src={finalResult.url}
                    alt="Final result"
                    className="w-full max-h-[500px] object-contain bg-black/20"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/x-gallery-image", finalResult.url);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  />
                  <div className="p-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDownload(finalResult.url, "final")}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium flex items-center gap-2 hover:bg-primary/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom spacer for scroll */}
        <div className="h-8" />
      </div>

      {/* Media picker modal */}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        accept={["image"]}
      />
    </div>
  );
};

export default MultiPlan;
