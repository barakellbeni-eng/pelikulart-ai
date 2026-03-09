import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Upload, Loader2, Download, Trash2, X, Sparkles, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import MediaPickerModal from "@/components/MediaPickerModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { LENS_TYPE_ICONS, FOCAL_ICONS } from "@/components/LensIcons";

import GenerationProgress from "@/components/GenerationProgress";

const START_GENERATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-generation`;

/* ── Lens types ── */
const LENS_TYPES = [
  { id: "prime", label: "Prime", sub: "Focale fixe" },
  { id: "anamorphic", label: "Anamorphique", sub: "Cinéma 2.39:1" },
  { id: "macro", label: "Macro", sub: "Détails 1:1" },
  { id: "special", label: "Spéciaux", sub: "Fisheye · Tilt" },
] as const;

type LensTypeId = (typeof LENS_TYPES)[number]["id"];

/* ── Focal lengths per type ── */
const FOCALS: Record<LensTypeId, { value: string; label: string; sub: string }[]> = {
  prime: [
    { value: "14", label: "14mm", sub: "Ultra" },
    { value: "24", label: "24mm", sub: "Grand" },
    { value: "35", label: "35mm", sub: "Repor." },
    { value: "50", label: "50mm", sub: "Standard" },
    { value: "85", label: "85mm", sub: "Portrait" },
    { value: "135", label: "135mm", sub: "Télé" },
  ],
  anamorphic: [
    { value: "1.33x", label: "1.33×", sub: "Léger" },
    { value: "1.5x", label: "1.5×", sub: "Flares" },
    { value: "2x", label: "2×", sub: "Hollywood" },
  ],
  macro: [
    { value: "60", label: "60mm", sub: "Court" },
    { value: "100", label: "100mm", sub: "Macro 1:1" },
    { value: "180", label: "180mm", sub: "Télé" },
  ],
  special: [
    { value: "fisheye", label: "Fisheye", sub: "180°" },
    { value: "tilt-shift", label: "Tilt-Shift", sub: "Miniature" },
    { value: "lensbaby", label: "Lensbaby", sub: "Artistique" },
  ],
};

/* ── Apertures ── */
const APERTURES = [
  { value: "auto", label: "Auto", sub: "Optimal" },
  { value: "f/1.4", label: "f/1.4", sub: "Bokeh max" },
  { value: "f/2.8", label: "f/2.8", sub: "Équilibré" },
  { value: "f/8", label: "f/8", sub: "Net total" },
];

/* ── FOV map ── */
const FOV_MAP: Record<string, number> = {
  "14": 114, "24": 84, "35": 63, "50": 47, "85": 28, "135": 18,
  "1.33x": 54, "1.5x": 50, "2x": 44,
  "60": 39, "100": 24, "180": 14,
  fisheye: 180, "tilt-shift": 47, lensbaby: 47,
};

/* ── Prompt builder ── */
function buildLensPrompt(type: LensTypeId, focal: string, aperture: string, fov: number): string {
  const focalObj = FOCALS[type]?.find((f) => f.value === focal);
  const focalLabel = focalObj?.label || focal;

  const parts = ["Same scene and subject"];

  if (type === "prime") {
    parts.push(`shot with a ${focalLabel} standard lens`);
  } else if (type === "anamorphic") {
    parts.push(`shot with a ${focalLabel} anamorphic lens, horizontal lens flares, cinematic 2.39:1 widescreen`);
  } else if (type === "macro") {
    parts.push(`shot with a ${focalLabel} macro lens, extreme close-up detail, shallow depth of field`);
  } else {
    if (focal === "fisheye") parts.push("shot with a fisheye lens, extreme barrel distortion, 180° field of view");
    else if (focal === "tilt-shift") parts.push("shot with a tilt-shift lens, miniature effect, selective focus plane");
    else parts.push("shot with a lensbaby lens, artistic selective focus, dreamy swirl bokeh");
  }

  parts.push(`${fov}° field of view`);

  if (aperture !== "auto") {
    parts.push(`aperture ${aperture}`);
    if (aperture === "f/1.4") parts.push("extreme bokeh, creamy background blur");
    else if (aperture === "f/8") parts.push("deep focus, everything sharp");
  }

  parts.push("cinematic, photorealistic");

  return parts.join(", ");
}

function fovDescription(fov: number): string {
  if (fov >= 100) return "Champ ultra-large — Déformation visible aux bords";
  if (fov >= 70) return "Grand angle — Immersion et profondeur";
  if (fov >= 40) return "Vision naturelle — Rendu proche de l'œil humain";
  if (fov >= 25) return "Cadrage serré — Compression de l'espace";
  return "Téléobjectif — Compression extrême, bokeh prononcé";
}

/* ── Gallery item ── */
interface GalleryItem {
  id: string;
  url: string;
  originalUrl?: string;
  prompt: string;
  created_at: string;
}

const COST = 1;

const LensControl = () => {
  const { user } = useAuth();
  const { balance: credits, refetch: refreshBalance } = useCauris();
  const location = useLocation();

  /* Controls */
  const [lensType, setLensType] = useState<LensTypeId>("prime");
  const [focal, setFocal] = useState("50");
  const [aperture, setAperture] = useState("auto");
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  /* UI state */
  const [activeTab] = useState<"results">("results");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fov = FOV_MAP[focal] ?? 47;
  const prompt = buildLensPrompt(lensType, focal, aperture, fov);
  const focalLabel = FOCALS[lensType]?.find((f) => f.value === focal)?.label || focal;

  /* Reset focal when lens type changes */
  useEffect(() => {
    const firstFocal = FOCALS[lensType]?.[0]?.value;
    if (firstFocal) setFocal(firstFocal);
  }, [lensType]);

  /* Source from navigation state */
  useEffect(() => {
    const stateImage = (location.state as any)?.sourceImage;
    if (stateImage && typeof stateImage === "string") setSourceImage(stateImage);
  }, [location.state]);

  /* Load gallery */
  const loadGallery = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("tool_type", "image")
      .like("prompt", "Lens Control:%")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGallery(
        (data as any[])
          .filter((d: any) => d.result_url)
          .map((d: any) => ({
            id: d.id,
            url: d.result_url!,
            originalUrl: d.result_url_original || d.result_url,
            prompt: d.prompt,
            created_at: d.created_at,
          }))
      );
    }
    setLoadingGallery(false);
  }, [user]);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  /* Handlers */
  const handleMediaSelect = useCallback((url: string) => {
    setSourceImage(url);
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) { setSourceImage(imageUrl); return; }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage || isGenerating) return;

    if (!user) {
      toast.error("Connectez-vous pour générer");
      return;
    }

    if (!credits || credits < COST) {
      toast.error(`Solde insuffisant — ${COST} cauris requis`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const finalPrompt = `Lens Control: ${lensType} ${focalLabel} ${aperture} — ${prompt}`;

      const resp = await fetch(START_GENERATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tool_type: "image",
          model_id: "kie-nano-banana-2",
          prompt: finalPrompt,
          image_urls: [sourceImage],
          cauris_cost: COST,
          settings: {},
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const kieData = await resp.json();
      if (kieData.new_balance !== undefined) refreshBalance();

      // Poll for completion
      const jobId = kieData.job_id;
      if (jobId) {
        const maxPolls = 200;
        for (let i = 0; i < maxPolls; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const { data: jobRow } = await supabase
            .from("generation_jobs")
            .select("status, result_url, result_metadata")
            .eq("id", jobId)
            .single();

          if (jobRow?.status === "completed") {
            await loadGallery();
            refreshBalance();
            
            toast.success("Image générée !");
            setIsGenerating(false);
            return;
          }
          if (jobRow?.status === "failed") {
            const errMsg = (jobRow.result_metadata as any)?.error || "La génération a échoué";
            throw new Error(errMsg);
          }
        }
        throw new Error("La génération a pris trop de temps (timeout)");
      }

      await loadGallery();
      refreshBalance();
      
      toast.success("Génération terminée !");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pelikulart-lens-${focalLabel}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("Téléchargement lancé");
    } catch {
      toast.error("Échec du téléchargement");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("generation_jobs")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", deleteTarget.id);
      if (error) throw error;
      await loadGallery();
      toast.success("Image supprimée");
    } catch {
      toast.error("Échec de la suppression");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const canGenerate = !!sourceImage && !isGenerating;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="w-80 shrink-0 bg-card/50 backdrop-blur-xl flex flex-col h-full overflow-hidden border-r border-border">
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Objectif
              </h2>
              <p className="text-xs text-muted-foreground">Contrôle précis du rendu optique</p>
            </div>
            <span className="text-xs font-bold text-primary">{COST} cauris</span>
          </div>

          {/* Source image */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Image source</label>
            {sourceImage ? (
              <div className="relative rounded-xl overflow-hidden bg-muted/20 aspect-video group">
                <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSourceImage(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="h-32 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 bg-muted/10 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                onClick={() => setShowMediaPicker(true)}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Ajouter une image</span>
                <span className="text-[10px] text-muted-foreground/60">JPG · PNG · WEBP</span>
              </div>
            )}
          </div>

          {/* Lens type */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Type d'objectif</label>
            <div className="grid grid-cols-2 gap-1.5">
              {LENS_TYPES.map((t) => {
                const TypeIcon = LENS_TYPE_ICONS[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => setLensType(t.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-xs ${
                      lensType === t.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {TypeIcon && <TypeIcon className="w-5 h-5 shrink-0" />}
                    <div>
                      <div className="font-bold leading-tight">{t.label}</div>
                      <div className="text-[9px] opacity-70">{t.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focal length */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Focale</label>
            <div className="flex flex-wrap gap-1.5">
              {FOCALS[lensType].map((f) => {
                const FocalIcon = FOCAL_ICONS[f.value];
                const isActive = focal === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFocal(f.value)}
                    className={`flex flex-col items-center px-2 py-2 rounded-xl text-center transition-all min-w-[52px] ${
                      isActive
                        ? "bg-primary/10 ring-1 ring-primary/40"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {FocalIcon && <FocalIcon className="w-6 h-6 mb-1" />}
                    <div className={`text-[10px] font-bold leading-tight ${isActive ? "text-primary" : ""}`}>{f.label}</div>
                    <div className="text-[8px] opacity-60">{f.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aperture */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ouverture</label>
            <div className="flex gap-1">
              {APERTURES.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAperture(a.value)}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    aperture === a.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="text-[11px] font-bold">{a.label}</div>
                  <div className="text-[9px] opacity-60">{a.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* FOV indicator */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Champ de vision</label>
              <span className="text-xs font-bold text-primary">{fov}°</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min((fov / 180) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Prompt preview */}
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Prompt</label>
            <p className="text-[10px] text-muted-foreground/80 bg-muted/10 rounded-lg p-2 leading-relaxed">{prompt}</p>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-4 border-t border-border space-y-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Appliquer l'objectif
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-2 border-b border-border/10">
          <h3 className="px-4 py-2 font-bold text-sm text-foreground border-b-2 border-primary">
            Mes résultats
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4 scrollbar-thin">
            <>
              {/* Loading state during generation */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-border/30">
                      <img src={sourceImage || ""} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <GenerationProgress estimatedTime="~15s" />
                        <p className="text-xs text-muted-foreground/80">Application de l'objectif…</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingGallery ? (
                <div className="flex items-center justify-center h-60">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : gallery.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun résultat pour le moment</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Uploade une image et applique un objectif</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-xl overflow-hidden aspect-square bg-muted/20 cursor-pointer"
                      onClick={() => setPreviewItem(item)}
                    >
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item.originalUrl || item.url); }}
                          className="w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          className="w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
        </div>
      </div>

      {/* Media Picker */}
      {showMediaPicker && (
        <MediaPickerModal
          open={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
          accept={["image"]}
        />
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full bg-card rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={previewItem.url} alt="" className="w-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <DeleteConfirmModal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default LensControl;
