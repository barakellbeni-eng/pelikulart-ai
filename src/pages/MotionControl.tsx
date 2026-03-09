import "@fontsource/sora/700.css";
import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload, Loader2, Play, Download, Trash2, X, RefreshCw, Sparkles, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import MediaPickerModal from "@/components/MediaPickerModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";


const START_GENERATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-generation`;

const VIDEAS_PARAMS = "?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&mute=true&loop=true&info=true&thumbnail=video";

const buildEmbedUrl = (mediaId: string) =>
  `https://app.videas.fr/embed/media/${mediaId}/${VIDEAS_PARAMS}`;

const CAMERA_MOTIONS = [
  {
    id: "dolly-in",
    label: "Dolly In",
    mediaId: "6e924b80-8dbe-4927-9475-ac52a930c61e",
    prompt: "camera slowly moves forward toward subject, smooth dolly in tracking shot, cinematic depth, subject grows larger in frame",
  },
  {
    id: "dolly-out",
    label: "Dolly Out",
    mediaId: "3d231347-0855-4b20-8145-5eaff3bb7472",
    prompt: "camera slowly pulls back away from subject, smooth dolly out tracking shot, environment gradually revealed, subject shrinks in frame",
  },
  {
    id: "dolly-left",
    label: "Dolly Left",
    mediaId: "c6809fb1-1505-4fe0-bfdd-1750984ffa9f",
    prompt: "camera tracks laterally to the left, smooth sideways dolly movement, subject stays centered, strong parallax effect",
  },
  {
    id: "dolly-right",
    label: "Dolly Right",
    mediaId: "86d3f249-31ad-4fc3-b26d-3cd7990aedc0",
    prompt: "camera tracks laterally to the right, smooth sideways dolly movement, subject stays centered, strong parallax effect",
  },
  {
    id: "pan-left",
    label: "Pan Left",
    mediaId: "6b5bf490-e237-46b3-a85c-2aa2d7d08d46",
    prompt: "camera pivots horizontally to the left from a fixed position, smooth pan movement, scene sweeps right to left",
  },
  {
    id: "pan-right",
    label: "Pan Right",
    mediaId: "a9d9f49c-229b-43fb-933c-28aa4ef9233e",
    prompt: "camera pivots horizontally to the right from a fixed position, smooth pan movement, scene sweeps left to right",
  },
  {
    id: "tilt-up",
    label: "Tilt Up",
    mediaId: "a006b2f6-3774-4236-a4cd-1a3390886c75",
    prompt: "camera tilts upward from a fixed position, smooth vertical pivot, reveals full height from bottom to top",
  },
  {
    id: "tilt-down",
    label: "Tilt Down",
    mediaId: "856e93fe-a832-41bc-a9c8-db188efb8331",
    prompt: "camera tilts downward from a fixed position, smooth vertical pivot, reveals subject from top to bottom",
  },
  {
    id: "zoom-in",
    label: "Zoom In",
    mediaId: "7b069455-674f-4011-9b67-18c3773841ed",
    prompt: "slow optical zoom in, subject magnifies gradually, no camera movement, cinematic",
  },
  {
    id: "zoom-out",
    label: "Zoom Out",
    mediaId: "72f14ffb-5592-4b58-9317-db8782ff39ea",
    prompt: "slow optical zoom out, subject shrinks gradually, environment revealed, no camera movement, cinematic",
  },
  {
    id: "crash-zoom-in",
    label: "Crash Zoom In",
    mediaId: "36e448f6-15b1-4cd6-87ff-dd36a6a355a9",
    prompt: "extremely fast aggressive zoom in, sudden impact punch effect, subject slams violently into frame",
  },
  {
    id: "crash-zoom-out",
    label: "Crash Zoom Out",
    mediaId: "d56a3db1-70c6-4dc9-a9c6-ce2137cc6b4a",
    prompt: "extremely fast aggressive zoom out, sudden shock effect, subject flies away from camera",
  },
  {
    id: "crane-down",
    label: "Crane Down",
    mediaId: "8d3cdabc-c45c-41d9-aee1-2284b4e742b2",
    prompt: "camera descends vertically downward on a crane, smooth drop from aerial height, intimate ground reveal",
  },
  {
    id: "jib-up",
    label: "Jib Up",
    mediaId: "5f0d04f6-3e72-4fd1-b809-9bfb73979785",
    prompt: "camera swings upward on a jib arm, smooth arc from low angle to high angle, sweeping elevation",
  },
  {
    id: "jib-down",
    label: "Jib Down",
    mediaId: "2f0beae3-da91-4ce0-b50f-47667c0c31d6",
    prompt: "camera swings downward on a jib arm, smooth arc from high angle to low angle, descending reveal",
  },
  {
    id: "handheld",
    label: "Handheld",
    mediaId: "6f95455a-ea5a-4ec1-b9d8-a691d509ba86",
    prompt: "handheld camera movement, natural shoulder-mounted micro-vibrations, documentary feel, organic human movement",
  },
  {
    id: "car-chasing",
    label: "Car Chasing",
    mediaId: "36cb1fa3-fb2b-4c39-8606-0d2c16530ec6",
    prompt: "low camera mounted on vehicle, fast tracking movement, ground-level perspective, dynamic chase speed effect",
  },
  {
    id: "lazy-susan",
    label: "Lazy Susan",
    mediaId: "fc3d4942-320b-4994-8133-019ee81b386e",
    prompt: "subject rotates 360 degrees on a turntable, camera stays fixed, full rotation reveal",
  },
] as const;

const DURATIONS = [
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
];

interface GeneratedVideo {
  id: string;
  url: string;
  originalUrl?: string;
  prompt: string;
  motion: string;
  created_at: string;
}

const MotionControl = () => {
  const { user } = useAuth();
  const { balance: credits, refetch: refreshBalance } = useCauris();
  const navigate = useNavigate();
  const location = useLocation();

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>("5");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [activeTab, setActiveTab] = useState<"generations" | "motions">("generations");

  const [isGenerating, setIsGenerating] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [gallery, setGallery] = useState<GeneratedVideo[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [previewVideo, setPreviewVideo] = useState<GeneratedVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GeneratedVideo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedMotionData = CAMERA_MOTIONS.find((m) => m.id === selectedMotion);

  useEffect(() => {
    const stateImage = (location.state as any)?.sourceImage;
    if (stateImage && typeof stateImage === "string") {
      setSourceImage(stateImage);
    }
  }, [location.state]);

  const loadGallery = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("generation_jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("tool_type", "video")
      .like("prompt", "Motion Control:%")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const items = (data as any[])
        .filter((d: any) => d.result_url)
        .map((d: any) => {
          const match = d.prompt.match(/Motion Control: ([\w\s]+) —/);
          return {
            id: d.id,
            url: d.result_url!,
            originalUrl: d.result_url_original || d.result_url,
            prompt: d.prompt,
            motion: match ? match[1] : "Unknown",
            created_at: d.created_at,
          };
        });
      setGallery(items);
    }
    setLoadingGallery(false);
  }, [user]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleMediaSelect = useCallback((url: string) => {
    setSourceImage(url);
    setShowMediaPicker(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image") || e.dataTransfer.getData("text/uri-list");
    if (imageUrl) {
      setSourceImage(imageUrl);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage || !selectedMotion || !user || isGenerating) return;

    const motionData = CAMERA_MOTIONS.find((m) => m.id === selectedMotion);
    if (!motionData) return;

    if (!credits || credits < 30) {
      toast.error("Solde insuffisant — 30 cauris requis");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const finalPrompt = `Motion Control: ${motionData.label} — ${motionData.prompt}`;

      const payload = {
        model_id: "kie-kling-25-turbo",
        prompt: finalPrompt,
        settings: {
          duration,
          aspect_ratio: aspectRatio,
        },
        images: [sourceImage],
      };

      const resp = await fetch(START_GENERATION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }

      await loadGallery();
      refreshBalance();
      toast.success(`Génération lancée : ${motionData.label}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pelikulart-motion-${name}-${date}.mp4`;
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
      const { error } = await supabase.from("generation_jobs").update({ deleted_at: new Date().toISOString() }).eq("id", deleteTarget.id);
      if (error) throw error;
      await loadGallery();
      toast.success("Vidéo supprimée");
    } catch {
      toast.error("Échec de la suppression");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const canGenerate = sourceImage && selectedMotion && !isGenerating;
  const costCauris = duration === "10" ? 60 : 30;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Left panel: Settings */}
      <div className="w-80 shrink-0 bg-card/50 backdrop-blur-xl flex flex-col h-full overflow-hidden border-r border-border">
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Motion Control</h2>
            <p className="text-xs text-muted-foreground">Ajoute des mouvements de caméra cinématiques à tes images</p>
          </div>

          {/* Motion Selector — ABOVE image source */}
          <div className="space-y-2">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Mouvement</label>

            {selectedMotionData ? (
              /* Selected motion preview */
              <div className="relative rounded-xl overflow-hidden border border-primary/30 bg-muted/10">
                <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                  <iframe
                    src={buildEmbedUrl(selectedMotionData.mediaId)}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="unsafe-url"
                    title={selectedMotionData.label}
                    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                  />
                </div>
                {/* Title centered */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p
                    style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, lineHeight: 1 }}
                    className="text-2xl text-white uppercase tracking-tight drop-shadow-lg text-center"
                  >
                    {selectedMotionData.label}
                  </p>
                </div>
                {/* Change button — top right inside preview */}
                <button
                  onClick={() => setActiveTab("motions")}
                  className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-md"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Changer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("motions")}
                className="w-full h-32 rounded-xl border-2 border-dashed border-border/50 bg-muted/10 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Sélectionner un mouvement</span>
              </button>
            )}
          </div>

          {/* Source Image */}
          <div className="space-y-2">
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
                className="h-40 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 bg-muted/10 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                onClick={() => setShowMediaPicker(true)}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Déposer ou cliquer</span>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Durée</label>
            <div className="flex gap-1">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    duration === d.value ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ratio</label>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAspectRatio(r.value)}
                  className={`flex-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    aspectRatio === r.value ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Coût</span>
            <span className="font-bold text-primary">{costCauris} cauris</span>
          </div>
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
                <Play className="w-4 h-4" />
                Générer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right panel: Gallery only */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <h3 className="text-sm font-bold text-foreground mb-4">Mes générations</h3>
          {loadingGallery ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Aucune génération pour le moment</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Sélectionne un mouvement et génère ta première vidéo</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {gallery.map((video) => (
                <div key={video.id} className="relative group rounded-xl overflow-hidden aspect-video bg-muted/20 cursor-pointer" onClick={() => setPreviewVideo(video)}>
                  <video src={video.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-white">{video.motion}</span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video.originalUrl || video.url, video.motion);
                      }}
                      className="w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(video);
                      }}
                      className="w-7 h-7 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPickerModal
          open={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => handleMediaSelect(url)}
          accept={["image"]}
        />
      )}

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewVideo(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-4xl w-full bg-card rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreviewVideo(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                <X className="w-5 h-5" />
              </button>
              <video src={previewVideo.url} controls autoPlay className="w-full" />
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-foreground">{previewVideo.motion}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
};

export default MotionControl;
