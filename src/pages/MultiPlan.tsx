import { useState, useCallback } from "react";
import { Upload, Loader2, Camera, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import MediaPickerModal from "@/components/MediaPickerModal";

const MULTIPLAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-multiplan`;

const PLAN_TYPES = [
  { id: "close-up", label: "Close-up" },
  { id: "macro", label: "Macro" },
  { id: "serre", label: "Serré" },
  { id: "americain", label: "Américain" },
  { id: "large", label: "Large" },
  { id: "tres-large", label: "Très large" },
  { id: "plongee", label: "Plongée" },
  { id: "contre-plongee", label: "Contre-plongée" },
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

  const handleMediaSelect = useCallback((url: string) => {
    setSourceImage(url);
    setVariations([]);
    setSelectedVariation(null);
    setFinalResult(null);
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Support dragging gallery images
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) {
      setSourceImage(imageUrl);
      setVariations([]);
      setSelectedVariation(null);
      setFinalResult(null);
      return;
    }
    // Support file drop
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
      refreshBalance();
      toast.success("4 variations générées !");
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
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-gradient-gold">Multi-Plan</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Générez des variations cinématiques de votre image sous différents angles
          </p>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative"
        >
          {sourceImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
              <img src={sourceImage} alt="Source" className="w-full max-h-[300px] object-contain bg-black/20" />
              <button
                onClick={() => { setSourceImage(null); setVariations([]); setSelectedVariation(null); setFinalResult(null); }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground hover:bg-background transition-colors"
              >
                Changer l'image
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMediaPicker(true)}
              className="w-full border-2 border-dashed border-border rounded-2xl py-16 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              <Upload className="w-10 h-10" />
              <span className="text-sm font-medium">Ajouter une image source</span>
              <span className="text-xs text-muted-foreground/60">Cliquez ou glissez-déposez une image</span>
            </button>
          )}
        </div>

        {/* Plan type selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Type de plan
          </label>
          <div className="flex flex-wrap gap-2">
            {PLAN_TYPES.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedPlan === plan.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleVary}
          disabled={!sourceImage || isGenerating || !user}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Varier les plans
              <span className="text-sm opacity-70 ml-1">· 3 cauris</span>
            </>
          )}
        </button>

        {/* 4 variations grid */}
        <AnimatePresence>
          {(variations.length > 0 || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Variations générées
              </label>
              <div className="grid grid-cols-2 gap-3">
                {isGenerating
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={`loading-${i}`} className="aspect-square rounded-2xl bg-muted/20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
                      </div>
                    ))
                  : variations.map((v, i) => (
                      <motion.div
                        key={v.job_id || i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group"
                      >
                        <img
                          src={v.url}
                          alt={`Variation ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-2xl border border-border"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/x-gallery-image", v.url);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-[10px] font-bold text-foreground">
                          #{i + 1}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-foreground/60" />
                        </div>
                      </motion.div>
                    ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plan buttons */}
        <div className="space-y-3">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Sélectionnez un plan à affiner
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => {
              const idx = n - 1;
              const enabled = variations.length > 0 && variations[idx];
              const isActive = selectedVariation === idx;

              return (
                <button
                  key={n}
                  onClick={() => enabled && handlePlanClick(idx)}
                  disabled={!enabled || isGeneratingPlan}
                  className={`py-4 rounded-xl text-sm font-bold transition-all ${
                    isActive && isGeneratingPlan
                      ? "bg-primary/20 text-primary animate-pulse"
                      : isActive
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : enabled
                          ? "bg-card border border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                          : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                  }`}
                >
                  {isActive && isGeneratingPlan ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    `Plan ${n}`
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            Chaque plan coûte 2 cauris · Les images sont glissables vers d'autres outils
          </p>
        </div>

        {/* Final result */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Résultat final — sauvegardé dans Mes Générations
              </label>
              <div className="rounded-2xl overflow-hidden border border-primary/30 bg-card">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Media picker modal */}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        accept="image"
      />
    </div>
  );
};

export default MultiPlan;
