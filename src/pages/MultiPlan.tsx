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
  { id: "close-up", label: "Close-up" },
  { id: "macro", label: "Macro" },
  { id: "serre", label: "Serré" },
  { id: "americain", label: "Américain" },
  { id: "large", label: "Large" },
  { id: "tres-large", label: "Très large" },
  { id: "plongee", label: "Plongée" },
  { id: "contre-plongee", label: "Contre-plongée" },
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

  const hasResults = mainResult || Object.keys(planResults).length > 0;

  return (
    <div className="h-full flex overflow-hidden">
      {/* ───── CENTER: Gallery / Results ───── */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        {!hasResults && !isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground/30 text-sm">
              Les résultats apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Main result */}
            <AnimatePresence>
              {(mainResult || isGenerating) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isGenerating && !mainResult ? (
                    <div className="aspect-video rounded-lg bg-muted/5 flex items-center justify-center border border-border/20">
                      <Loader2 className="w-6 h-6 text-primary/30 animate-spin" />
                    </div>
                  ) : mainResult ? (
                    <div className="relative group rounded-lg overflow-hidden bg-black/30">
                      <img
                        src={mainResult.url}
                        alt="Résultat"
                        className="w-full max-h-[50vh] object-contain"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/x-gallery-image", mainResult.url);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                      />
                      <button
                        onClick={() => handleDownload(mainResult.url, "multiplan")}
                        className="absolute top-2 right-2 w-7 h-7 rounded bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-background/60 backdrop-blur-sm text-[9px] uppercase tracking-widest text-muted-foreground">
                        Source générée
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Plan results grid */}
            {mainResult && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const isLoading = loadingPlan === idx;
                  const result = planResults[idx];

                  return (
                    <div key={idx} className="space-y-1.5">
                      <button
                        onClick={() => handlePlanClick(idx)}
                        disabled={loadingPlan !== null}
                        className={`w-full py-2.5 rounded-lg text-[11px] font-medium transition-all border ${
                          isLoading
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : result
                              ? "border-primary/15 bg-primary/5 text-primary/70 hover:bg-primary/10"
                              : "border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                        } ${loadingPlan !== null && !isLoading ? "opacity-20 cursor-not-allowed" : ""}`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                        ) : (
                          `Plan ${idx + 1}`
                        )}
                      </button>

                      <AnimatePresence>
                        {result && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-lg overflow-hidden bg-black/20"
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

                      {isLoading && (
                        <div className="w-full aspect-[3/4] rounded-lg bg-muted/5 flex items-center justify-center border border-border/10">
                          <Loader2 className="w-3.5 h-3.5 text-primary/20 animate-spin" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ───── RIGHT: Settings Panel ───── */}
      <div className="w-[280px] h-full border-l border-border/30 bg-card/30 flex flex-col overflow-hidden shrink-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-sm font-semibold text-foreground">Multi-Plan</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Cadrages cinématiques</p>
          </div>

          {/* Source image */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Source</label>
            <motion.div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              {sourceImage ? (
                <div className="relative rounded-lg overflow-hidden bg-black/40">
                  <img src={sourceImage} alt="Source" className="w-full aspect-video object-cover" />
                  <button
                    onClick={() => { setSourceImage(null); setMainResult(null); setPlanResults({}); }}
                    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full border border-dashed border-border/40 rounded-lg py-8 flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:border-primary/20 hover:text-muted-foreground transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">Image source</span>
                </button>
              )}
            </motion.div>
          </div>

          {/* Plan type */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Type de plan</label>
            <div className="grid grid-cols-2 gap-1">
              {PLAN_TYPES.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`px-2 py-1.5 rounded text-[10px] font-medium text-left transition-all ${
                    selectedPlan === plan.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ratio */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Ratio</label>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRatio(r.id)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-mono text-center transition-all ${
                    selectedRatio === r.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Qualité</label>
            <div className="flex gap-1">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResolution(r.id)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-mono text-center transition-all ${
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
        </div>

        {/* Sticky generate button */}
        <div className="p-4 border-t border-border/20">
          <button
            onClick={handleGenerate}
            disabled={!sourceImage || isGenerating || !user}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:brightness-110"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                Générer · 2 cauris
              </>
            )}
          </button>
        </div>
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
