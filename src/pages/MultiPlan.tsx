import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload, Loader2, Camera, Download, Trash2, X, Scissors, RefreshCw, Video, RotateCcw, Crosshair, Lock, CheckCircle2 } from "lucide-react";
import GenerationProgress from "@/components/GenerationProgress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import MediaPickerModal from "@/components/MediaPickerModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const MULTIPLAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-multiplan`;
const DELETE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

const PLAN_TYPES = [
  { id: "close-up", label: "Close-up" },
  { id: "extreme-close-up", label: "Très gros plan" },
  { id: "macro", label: "Macro" },
  { id: "serre", label: "Serré" },
  { id: "taille", label: "Plan taille" },
  { id: "americain", label: "Américain" },
  { id: "moyen", label: "Plan moyen" },
  { id: "large", label: "Large" },
  { id: "tres-large", label: "Très large" },
  { id: "general", label: "Plan général" },
  { id: "plongee", label: "Plongée" },
  { id: "contre-plongee", label: "Contre-plongée" },
  { id: "dutch-angle", label: "Dutch angle" },
  { id: "over-shoulder", label: "Par-dessus l'épaule" },
  { id: "bird-eye", label: "Vue aérienne" },
  { id: "worm-eye", label: "Vue en contre-bas" },
  { id: "profile", label: "Profil" },
  { id: "pov", label: "POV" },
  { id: "three-quarter", label: "Trois-quarts" },
] as const;

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1" },
  { id: "16:9", label: "16:9" },
  { id: "9:16", label: "9:16" },
] as const;

const RESOLUTIONS = [
  { id: "1K", label: "1K" },
  { id: "2K", label: "2K" },
  { id: "4K", label: "4K" },
] as const;

type PlanTypeId = (typeof PLAN_TYPES)[number]["id"];
type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];
type ResolutionId = (typeof RESOLUTIONS)[number]["id"];

interface PersistedItem {
  id: string;
  url: string;
  prompt: string;
  created_at: string;
}

const MultiPlan = () => {
  const { user } = useAuth();
  const { refetch: refreshBalance } = useCauris();
  const navigate = useNavigate();
  const location = useLocation();

  const [sourceImage, setSourceImage] = useState<string | null>(null);

  useEffect(() => {
    const stateImage = (location.state as any)?.sourceImage;
    if (stateImage && typeof stateImage === "string") {
      setSourceImage(stateImage);
    }
  }, [location.state]);

  const [selectedPlan, setSelectedPlan] = useState<PlanTypeId>("close-up");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioId>("1:1");
  const [selectedResolution, setSelectedResolution] = useState<ResolutionId>("2K");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCuttingAll, setIsCuttingAll] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  // Queue state for "Découper tout": 'idle' | 'waiting' | 'running' | 'done'
  const [queueStatus, setQueueStatus] = useState<Record<number, 'idle' | 'waiting' | 'running' | 'done'>>({
    1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle',
  });
  const isAnyJobRunning = isCuttingAll || isGenerating || loadingPlan !== null;
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCadragePicker, setShowCadragePicker] = useState(false);
  const [cadrageSource, setCadrageSource] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<PersistedItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersistedItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Persisted gallery from DB
  const [gallery, setGallery] = useState<PersistedItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // Latest main result (for cadrage buttons)
  const [latestMainResult, setLatestMainResult] = useState<{ url: string; job_id: string } | null>(null);

  // Load Multi-Plan generations from DB
  const loadGallery = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("generation_jobs")
      .select("id, result_url, prompt, created_at")
      .eq("user_id", user.id)
      .like("prompt", "Multi-Plan%")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const items = data
        .filter((d) => d.result_url)
        .map((d) => ({
          id: d.id,
          url: d.result_url!,
          prompt: d.prompt,
          created_at: d.created_at,
        }));
      setGallery(items);
      // Auto-set latest result as source for cadrages
      if (items.length > 0 && !latestMainResult) {
        setLatestMainResult({ url: items[0].url, job_id: items[0].id });
      }
    }
    setLoadingGallery(false);
  }, [user]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

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
    setLatestMainResult(null);
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) {
      setSourceImage(imageUrl);
      setLatestMainResult(null);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setSourceImage(reader.result as string);
        setLatestMainResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage || !user || isGenerating) return;
    setIsGenerating(true);
    setLatestMainResult(null);

    try {
      const result = await callGenerate(sourceImage, selectedPlan);
      setLatestMainResult(result);
      // Reload gallery to include new result
      await loadGallery();
      refreshBalance();
      toast.success("Image générée !");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanClick = async (planIndex: number) => {
    if (!cadrageSource || !user || loadingPlan !== null) return;
    setLoadingPlan(planIndex);

    try {
      await callGenerate(cadrageSource, selectedPlan, planIndex + 1);
      await loadGallery();
      refreshBalance();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCutAll = async () => {
    if (!cadrageSource || !user || isCuttingAll || loadingPlan !== null) return;
    setIsCuttingAll(true);
    setQueueStatus({ 1: 'waiting', 2: 'waiting', 3: 'waiting', 4: 'waiting' });

    try {
      for (let i = 1; i <= 4; i++) {
        setQueueStatus(prev => ({ ...prev, [i]: 'running' }));
        await callGenerate(cadrageSource, selectedPlan, i);
        setQueueStatus(prev => ({ ...prev, [i]: 'done' }));
      }
      await loadGallery();
      refreshBalance();
      toast.success("4 cadrages générés !");
    } catch (e: any) {
      toast.error(e.message);
      await loadGallery();
      refreshBalance();
    } finally {
      setIsCuttingAll(false);
      // Reset queue after a short delay so user sees the "done" state
      setTimeout(() => setQueueStatus({ 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle' }), 3000);
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

  const handleDelete = async (item: PersistedItem) => {
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const resp = await fetch(DELETE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: item.id }),
      });

      if (!resp.ok) throw new Error("Erreur lors de la suppression");

      setGallery((prev) => prev.filter((g) => g.id !== item.id));
      if (previewImage?.id === item.id) setPreviewImage(null);
      toast.success("Image supprimée");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* ───── CENTER: Gallery / Results ───── */}
      <div className="flex-1 h-full overflow-y-auto p-6">
        {loadingGallery ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
          </div>
        ) : gallery.length === 0 && !isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground/30 text-sm">
              Les résultats apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Loading placeholder */}
            {isGenerating && (
              <div className="aspect-video rounded-lg bg-muted/5 flex flex-col items-center justify-center border border-border/20 gap-3">
                <GenerationProgress estimatedTime="~15s" />
              </div>
            )}

            {loadingPlan !== null && (
              <div className="aspect-video rounded-lg bg-muted/5 flex flex-col items-center justify-center border border-border/20 gap-3">
                <GenerationProgress estimatedTime="~15s" />
              </div>
            )}

            {/* Persisted gallery grid */}
            <div className="space-y-4">
              {gallery.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-lg overflow-hidden bg-black/30 cursor-pointer"
                  onClick={() => setPreviewImage(item)}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full max-h-[60vh] object-contain"
                    loading="lazy"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/x-gallery-image", item.url);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/studio/create?mode=image", { state: { recreateParams: { prompt: item.prompt, sourceImage: item.url } } }); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
                      title="Recréer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/studio/create?mode=video", { state: { sourceImage: item.url } }); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
                      title="Envoyer vers vidéo"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSourceImage(item.url); setLatestMainResult(null); toast.success("Image définie comme source Multi-Plan"); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
                      title="Envoyer vers Multi-Shot"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.id.slice(0, 8)); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
                      title="Télécharger"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-destructive/80 backdrop-blur-sm hover:bg-destructive transition-all text-destructive-foreground shadow-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white/80 line-clamp-1">{item.prompt}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                <div className="relative rounded-lg overflow-hidden bg-black/40 group/plans">
                  <img src={sourceImage} alt="Source" className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-0 group-hover/plans:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className="flex items-center justify-center border border-primary/40"
                        style={{ background: 'hsla(var(--primary) / 0.12)' }}
                      >
                        <span className="w-7 h-7 rounded-full bg-primary/80 text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg backdrop-blur-sm">
                          {num}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setSourceImage(null); setLatestMainResult(null); }}
                    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors z-10"
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

          {/* Plan type - dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Type de plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as PlanTypeId)}
              className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-border/30 text-xs text-foreground appearance-none cursor-pointer hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
            >
              {PLAN_TYPES.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.label}</option>
              ))}
            </select>
          </div>

          {/* Generate button */}
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

          {/* Cadrage source + buttons */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Image de cadrage</label>
            {cadrageSource ? (
              <div className="relative rounded-lg overflow-hidden bg-black/40 group/cadrage">
                <img src={cadrageSource} alt="Cadrage source" className="w-full aspect-video object-cover" />
                <button
                  onClick={() => setCadrageSource(null)}
                  className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-background/70 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCadragePicker(true)}
                className="w-full border border-dashed border-border/40 rounded-lg py-6 flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:border-primary/20 hover:text-muted-foreground transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="text-[10px]">Choisir une image</span>
              </button>
            )}

            {cadrageSource && (
              <div className="space-y-2 mt-2">
                {/* Queue display when cutting all */}
                {isCuttingAll && (
                  <div className="rounded-lg border border-border/30 bg-muted/10 p-2.5 space-y-1.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">File d'attente</p>
                    {[1, 2, 3, 4].map((idx) => {
                      const status = queueStatus[idx];
                      return (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          {/* Spinner / Check */}
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                            {status === 'waiting' && (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30" />
                            )}
                            {status === 'running' && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#ccff00' }} />
                            )}
                            {status === 'done' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          {/* Label */}
                          <span className={`text-[11px] flex-1 ${status === 'running' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            Plan {idx}
                          </span>
                          {/* Status text */}
                          <span className={`text-[10px] ${
                            status === 'waiting' ? 'text-muted-foreground/50' :
                            status === 'running' ? 'text-[#ccff00] font-medium' :
                            'text-emerald-400 font-medium'
                          }`}>
                            {status === 'waiting' && 'En attente'}
                            {status === 'running' && 'En cours'}
                            {status === 'done' && '✓ Prêt'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={handleCutAll}
                  disabled={isCuttingAll || loadingPlan !== null}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:brightness-110"
                >
                  {isCuttingAll ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Découpe en cours...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3.5 h-3.5" />
                      Découper tout · 8 cauris
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  {[0, 1, 2, 3].map((idx) => {
                    const isLoading = loadingPlan === idx;
                    const locked = isAnyJobRunning && !isLoading;
                    return (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => !locked && handlePlanClick(idx)}
                              disabled={isLoading}
                              className={`py-2 rounded-lg text-[11px] font-medium transition-all border relative ${
                                isLoading
                                  ? "border-primary/30 bg-primary/5 text-primary"
                                  : locked
                                  ? "border-border/30 text-muted-foreground cursor-not-allowed"
                                  : "border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                              ) : locked ? (
                                <span className="flex items-center justify-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Cadrage {idx + 1}
                                </span>
                              ) : (
                                `Cadrage ${idx + 1}`
                              )}
                            </button>
                          </TooltipTrigger>
                          {locked && (
                            <TooltipContent side="top">
                              <p className="text-xs">Patientez, génération en cours</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">{previewImage.prompt}</h2>
                <button onClick={() => setPreviewImage(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img src={previewImage.url} alt={previewImage.prompt} className="w-full rounded-xl" />
              <p className="text-xs text-muted-foreground">
                {new Date(previewImage.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(previewImage.url, previewImage.id.slice(0, 8))}
                  className="btn-generate flex-1 flex items-center justify-center gap-2 text-sm py-3"
                >
                  <Download className="w-4 h-4" /> Télécharger
                </button>
                <button
                  onClick={() => { setDeleteTarget(previewImage); }}
                  className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={!!deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        accept={["image"]}
      />

      <MediaPickerModal
        open={showCadragePicker}
        onClose={() => setShowCadragePicker(false)}
        onSelect={(url) => { setCadrageSource(url); setShowCadragePicker(false); }}
        accept={["image"]}
      />
    </div>
  );
};

export default MultiPlan;
