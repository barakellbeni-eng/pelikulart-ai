import { useState, useCallback } from "react";
import { Upload, Loader2, Camera, Download } from "lucide-react";
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

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
  { id: "4:3", label: "4:3" },
  { id: "3:4", label: "3:4" },
] as const;

const RESOLUTIONS = [
  { id: "2K", label: "2K" },
  { id: "4K", label: "4K" },
] as const;

type PlanTypeId = (typeof PLAN_TYPES)[number]["id"];
type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];
type ResolutionId = (typeof RESOLUTIONS)[number]["id"];

const MultiPlan = () => {
  const { user } = useAuth();
  const { refetch: refreshBalance } = useCauris();

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTypeId>("close-up");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioId>("1:1");
  const [selectedResolution, setSelectedResolution] = useState<ResolutionId>("2K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mainResult, setMainResult] = useState<{ url: string; job_id: string } | null>(null);
  const [planResults, setPlanResults] = useState<Record<number, { url: string; job_id: string }>>({});
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const callGenerate = async (imageUrl: string, planType: string, planIndex?: number) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error("Non authentifié");

    const payload: any = { image_url: imageUrl, plan_type: planType, aspect_ratio: selectedRatio, resolution: selectedResolution };
    if (planIndex !== undefined) payload.plan_index = planIndex;

    const resp = await fetch(MULTIPLAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erreur" }));
      throw new Error(err.error || "Erreur lors de la génération");
    }

    const data = await resp.json();
    return data.image as { url: string; job_id: string };
  };

  const handleMediaSelect = useCallback((url: string) => {
    setSourceImage(url);
    setMainResult(null);
    setPlanResults({});
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) {
      setSourceImage(imageUrl);
      setMainResult(null);
      setPlanResults({});
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceImage(reader.result as string);
        setMainResult(null);
        setPlanResults({});
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage || !user || isGenerating) return;
    setIsGenerating(true);
    setMainResult(null);
    setPlanResults({});

    try {
      const result = await callGenerate(sourceImage, selectedPlan);
      setMainResult(result);
      refreshBalance();
      toast.success("Image générée !");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanClick = async (planIndex: number) => {
    if (!mainResult || !user || loadingPlan !== null) return;
    setLoadingPlan(planIndex);

    try {
      const result = await callGenerate(mainResult.url, selectedPlan, planIndex + 1);
      setPlanResults((prev) => ({ ...prev, [planIndex]: result }));
      refreshBalance();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingPlan(null);
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
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="h-full overflow-y-auto scroll-smooth bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Multi-Plan</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide uppercase">
            Cadrages cinématiques
          </p>
        </div>

        {/* Source image */}
        <motion.div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          {sourceImage ? (
            <div className="relative rounded-lg overflow-hidden bg-black/40">
              <img src={sourceImage} alt="Source" className="w-full max-h-[220px] object-contain" />
              <button
                onClick={() => { setSourceImage(null); setMainResult(null); setPlanResults({}); }}
                className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-medium bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Changer
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMediaPicker(true)}
              className="w-full border border-dashed border-border/50 rounded-lg py-14 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/30 hover:text-foreground/70 transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs">Ajouter une image</span>
            </button>
          )}
        </motion.div>

        {/* Controls row — compact */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Plan type */}
          <div className="flex flex-wrap gap-1.5">
            {PLAN_TYPES.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`px-3 py-1.5 rounded text-[11px] font-medium transition-all ${
                  selectedPlan === plan.id
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-border/30" />

          {/* Ratio */}
          <div className="flex gap-1">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  selectedRatio === r.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-border/30" />

          {/* Resolution */}
          <div className="flex gap-1">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedResolution(r.id)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  selectedResolution === r.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!sourceImage || isGenerating || !user}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:brightness-110"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Générer · 2 cauris
            </>
          )}
        </button>

        {/* Main result (before plan selection) */}
        <AnimatePresence>
          {mainResult && Object.keys(planResults).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-lg overflow-hidden bg-black/30"
            >
              <img
                src={mainResult.url}
                alt="Résultat"
                className="w-full max-h-[360px] object-contain"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/x-gallery-image", mainResult.url);
                  e.dataTransfer.effectAllowed = "copy";
                }}
              />
              <button
                onClick={() => handleDownload(mainResult.url, "multiplan")}
                className="absolute top-2 right-2 w-7 h-7 rounded bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Download className="w-3.5 h-3.5 text-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading placeholder for main gen */}
        {isGenerating && !mainResult && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
          </div>
        )}

        {/* 4 Plans — each with its result below */}
        <AnimatePresence>
          {mainResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Sélectionnez un plan · 2 cauris chacun
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const isLoading = loadingPlan === idx;
                  const result = planResults[idx];

                  return (
                    <div key={idx} className="space-y-2">
                      {/* Plan button */}
                      <button
                        onClick={() => handlePlanClick(idx)}
                        disabled={loadingPlan !== null}
                        className={`w-full py-3 rounded-lg text-xs font-semibold transition-all border ${
                          isLoading
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : result
                              ? "border-primary/20 bg-primary/5 text-primary/80 hover:bg-primary/10"
                              : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        } ${loadingPlan !== null && !isLoading ? "opacity-30 cursor-not-allowed" : ""}`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : (
                          `Plan ${idx + 1}`
                        )}
                      </button>

                      {/* Result below */}
                      <AnimatePresence>
                        {result && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-lg overflow-hidden bg-black/30"
                          >
                            <img
                              src={result.url}
                              alt={`Plan ${idx + 1}`}
                              className="w-full aspect-[3/4] object-cover"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/x-gallery-image", result.url);
                                e.dataTransfer.effectAllowed = "copy";
                              }}
                            />
                            <button
                              onClick={() => handleDownload(result.url, `plan-${idx + 1}`)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-3 h-3 text-foreground" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading placeholder */}
                      {isLoading && (
                        <div className="w-full aspect-[3/4] rounded-lg bg-muted/10 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-primary/30 animate-spin" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-8" />
      </div>

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
