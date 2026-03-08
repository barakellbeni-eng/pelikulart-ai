import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, Camera, Download, RotateCcw } from "lucide-react";
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
  { id: "1:1", label: "1:1", icon: "◻️" },
  { id: "16:9", label: "16:9", icon: "🖥️" },
  { id: "9:16", label: "9:16", icon: "📱" },
  { id: "4:3", label: "4:3", icon: "📺" },
  { id: "3:4", label: "3:4", icon: "📋" },
] as const;

const RESOLUTIONS = [
  { id: "2K", label: "2K", desc: "Standard" },
  { id: "4K", label: "4K", desc: "Haute qualité" },
] as const;

type PlanTypeId = typeof PLAN_TYPES[number]["id"];
type AspectRatioId = typeof ASPECT_RATIOS[number]["id"];
type ResolutionId = typeof RESOLUTIONS[number]["id"];

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

  const resultRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const planResultRef = useRef<HTMLDivElement>(null);

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
      toast.success(`Plan ${planIndex + 1} généré !`);
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

  const hasAnyPlanResult = Object.keys(planResults).length > 0;

  return (
    <div className="h-full overflow-y-auto scroll-smooth">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">
            <span className="text-gradient-gold">Multi-Plan</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Générez des cadrages cinématiques de votre image
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} layout>
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
                  onClick={() => { setSourceImage(null); setMainResult(null); setPlanResults({}); }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground hover:bg-background transition-colors"
                >
                  Changer
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
                <span className="text-xs text-muted-foreground/60">Cliquez ou glissez-déposez</span>
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
                whileTap={{ scale: 0.97 }}
              >
                <span>{plan.emoji}</span>
                {plan.label}
              </motion.button>
            ))}
          </div>
        </div>
        {/* Aspect ratio selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <motion.button
                key={ratio.id}
                onClick={() => setSelectedRatio(ratio.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedRatio === ratio.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <span>{ratio.icon}</span>
                {ratio.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Resolution selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Qualité
          </label>
          <div className="flex gap-2">
            {RESOLUTIONS.map((res) => (
              <motion.button
                key={res.id}
                onClick={() => setSelectedResolution(res.id)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedResolution === res.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {res.label}
                <span className="text-[10px] opacity-60 ml-1">{res.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleGenerate}
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
              <Camera className="w-5 h-5" />
              Générer le plan
              <span className="text-sm opacity-70 ml-1">· 2 cauris</span>
            </>
          )}
        </motion.button>

        {/* Main result — hidden once plan results exist */}
        <div ref={resultRef}>
          <AnimatePresence>
            {!hasAnyPlanResult && (mainResult || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="space-y-3"
              >
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Résultat
                </label>
                {isGenerating && !mainResult ? (
                  <div className="aspect-video rounded-2xl bg-muted/20 flex flex-col items-center justify-center gap-2 border border-border/50">
                    <Loader2 className="w-8 h-8 text-primary/50 animate-spin" />
                    <span className="text-xs text-muted-foreground/50">Génération en cours...</span>
                  </div>
                ) : mainResult ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-border">
                    <img
                      src={mainResult.url}
                      alt="Résultat"
                      className="w-full max-h-[400px] object-contain bg-black/20"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/x-gallery-image", mainResult.url);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                    />
                    <button
                      onClick={() => handleDownload(mainResult.url, "multiplan")}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                      <Download className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4 Plan buttons */}
        <div ref={plansRef}>
          <AnimatePresence>
            {mainResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Choisissez un plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((n) => {
                    const idx = n - 1;
                    const isLoading = loadingPlan === idx;
                    const hasResult = !!planResults[idx];

                    return (
                      <motion.button
                        key={n}
                        onClick={() => handlePlanClick(idx)}
                        disabled={loadingPlan !== null}
                        className={`py-5 rounded-xl text-sm font-bold transition-all border ${
                          isLoading
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : hasResult
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10"
                        } ${loadingPlan !== null && !isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        whileHover={loadingPlan === null ? { scale: 1.04, y: -3 } : {}}
                        whileTap={loadingPlan === null ? { scale: 0.96 } : {}}
                      >
                        {isLoading ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px]">Génération...</span>
                          </div>
                        ) : hasResult ? (
                          <div className="flex flex-col items-center gap-1">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Plan {n}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-normal">Relancer</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span>Plan {n}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-normal">2 cauris</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground/50">
                  Chaque plan génère un cadrage unique · 2 cauris par plan
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Plan results grid with download */}
        <div ref={planResultRef}>
          <AnimatePresence>
            {hasAnyPlanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  ✨ Plans générés — sauvegardés
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const result = planResults[idx];
                    if (!result) return null;
                    return (
                      <motion.div
                        key={result.job_id || idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-2xl overflow-hidden border border-primary/30 bg-card"
                      >
                        <img
                          src={result.url}
                          alt={`Plan ${idx + 1}`}
                          className="w-full aspect-square object-cover"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/x-gallery-image", result.url);
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-[10px] font-bold text-foreground">
                          Plan {idx + 1}
                        </div>
                        <button
                          onClick={() => handleDownload(result.url, `plan-${idx + 1}`)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        >
                          <Download className="w-3.5 h-3.5 text-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
