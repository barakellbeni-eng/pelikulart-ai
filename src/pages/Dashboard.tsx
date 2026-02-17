import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Image,
  Video,
  Sparkles,
  Download,
  Loader2,
  Upload,
  X,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Monitor,
  Smartphone,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

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

type AspectRatio = "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "3:4" | "2:3" | "9:16" | "4:5" | "5:4" | "auto";
type Resolution = "1K" | "2K" | "4K";
type OutputFormat = "png" | "jpeg" | "webp";
type GenerateMode = "text-to-image" | "image-to-image";

const aspectRatios: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  { value: "1:1", label: "1:1", icon: <Square className="w-3.5 h-3.5" /> },
  { value: "4:3", label: "4:3", icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
  { value: "3:2", label: "3:2", icon: <RectangleHorizontal className="w-3.5 h-3.5" /> },
  { value: "16:9", label: "16:9", icon: <Monitor className="w-3.5 h-3.5" /> },
  { value: "21:9", label: "21:9", icon: <Maximize2 className="w-3.5 h-3.5" /> },
  { value: "3:4", label: "3:4", icon: <RectangleVertical className="w-3.5 h-3.5" /> },
  { value: "2:3", label: "2:3", icon: <RectangleVertical className="w-3.5 h-3.5" /> },
  { value: "9:16", label: "9:16", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { value: "auto", label: "Auto", icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const resolutions: { value: Resolution; label: string; desc: string }[] = [
  { value: "1K", label: "1K", desc: "Standard" },
  { value: "2K", label: "2K", desc: "HD" },
  { value: "4K", label: "4K", desc: "Ultra HD" },
];

const formats: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
];

interface GeneratedImage {
  url: string;
  width?: number;
  height?: number;
}

const Dashboard = () => {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [generateMode, setGenerateMode] = useState<GenerateMode>("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [resolution, setResolution] = useState<Resolution>("1K");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoost = () => {
    const keyword = afrikaBoostKeywords[Math.floor(Math.random() * afrikaBoostKeywords.length)];
    setPrompt((prev) => (prev ? `${prev}, ${keyword}` : keyword));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setReferenceImage(dataUrl);
      setReferencePreview(dataUrl);
      setGenerateMode("image-to-image");
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferencePreview(null);
    setGenerateMode("text-to-image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const payload: Record<string, any> = {
        prompt,
        aspect_ratio: aspectRatio,
        resolution,
        output_format: outputFormat,
        num_images: numImages,
      };

      if (referenceImage && generateMode === "image-to-image") {
        payload.image_url = referenceImage;
      }

      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(err.error || `Erreur ${resp.status}`);
      }

      const data = await resp.json();
      if (data.images?.length) {
        setGeneratedImages(data.images);
      } else if (data.image_url) {
        setGeneratedImages([{ url: data.image_url }]);
      } else {
        throw new Error("Aucune image retournée");
      }
    } catch (e: any) {
      console.error("Generation error:", e);
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `afrikaart-${Date.now()}-${index}.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="h-full pb-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-5">
        {/* Top Bar: Mode + Generate Mode */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Image / Video toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-1 inline-flex gap-1"
          >
            <button
              onClick={() => setMode("image")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === "video"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="w-4 h-4" />
              VIDÉO
            </button>
          </motion.div>

          {/* Text-to-Image / Image-to-Image toggle */}
          {mode === "image" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-1 inline-flex gap-1"
            >
              <button
                onClick={() => {
                  setGenerateMode("text-to-image");
                  removeReferenceImage();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  generateMode === "text-to-image"
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Text → Image
              </button>
              <button
                onClick={() => setGenerateMode("image-to-image")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  generateMode === "image-to-image"
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Image → Image
              </button>
            </motion.div>
          )}
        </div>

        {/* Model info */}
        <p className="text-xs text-muted-foreground">
          Modèle : <span className="text-accent font-medium">{mode === "image" ? "Nano Banana Pro" : "Kling v2"}</span>
          <span className="ml-3 text-muted-foreground/60">
            {resolution} · {aspectRatio} · {outputFormat.toUpperCase()}
          </span>
        </p>

        {/* Settings Row */}
        {mode === "image" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4"
          >
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Format
              </label>
              <div className="flex flex-wrap gap-1.5">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      aspectRatio === ar.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "glass glass-hover text-muted-foreground"
                    }`}
                  >
                    {ar.icon}
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Résolution
              </label>
              <div className="flex gap-1.5">
                {resolutions.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res.value)}
                    className={`flex flex-col items-center px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      resolution === res.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "glass glass-hover text-muted-foreground"
                    }`}
                  >
                    <span className="font-bold">{res.label}</span>
                    <span className="text-[10px] opacity-70">{res.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Sortie
              </label>
              <div className="flex gap-1.5">
                {formats.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => setOutputFormat(fmt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      outputFormat === fmt.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "glass glass-hover text-muted-foreground"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of images */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Nombre
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumImages(n)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                      numImages === n
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "glass glass-hover text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reference Image Upload (Image-to-Image) */}
        {generateMode === "image-to-image" && mode === "image" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 block">
              Image de référence
            </label>
            {referencePreview ? (
              <div className="relative inline-block">
                <img
                  src={referencePreview}
                  alt="Reference"
                  className="max-h-40 rounded-xl border border-white/[0.08]"
                />
                <button
                  onClick={removeReferenceImage}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 glass glass-hover rounded-xl px-6 py-8 text-sm text-muted-foreground w-full justify-center border-dashed border-2 border-white/[0.08]"
              >
                <Upload className="w-5 h-5" />
                Glissez ou cliquez pour importer une image
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </motion.div>
        )}

        {/* Prompt Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 space-y-4"
        >
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              generateMode === "image-to-image"
                ? "Décrivez les modifications à apporter à l'image..."
                : mode === "image"
                  ? "Décrivez l'image que vous souhaitez créer..."
                  : "Décrivez la vidéo que vous souhaitez générer..."
            }
            className="min-h-[100px] bg-transparent border-0 resize-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base"
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
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>GÉNÉRER</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {(isGenerating || generatedImages.length > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 space-y-4"
            >
              {isGenerating ? (
                <div className="space-y-4">
                  <div
                    className={`grid gap-3 ${
                      numImages === 1
                        ? "grid-cols-1"
                        : numImages === 2
                          ? "grid-cols-2"
                          : "grid-cols-2"
                    }`}
                  >
                    {Array.from({ length: numImages }).map((_, i) => (
                      <div key={i} className="skeleton-ad w-full aspect-square rounded-xl" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Nano Banana Pro génère vos images...
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`grid gap-3 ${
                      generatedImages.length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}
                  >
                    {generatedImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-xl overflow-hidden bg-black/20"
                      >
                        <img
                          src={img.url}
                          alt={`Generated ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                          <span className="text-xs text-white/70">
                            {img.width && img.height
                              ? `${img.width}×${img.height}`
                              : resolution}
                          </span>
                          <button
                            onClick={() => handleDownload(img.url, i)}
                            className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {outputFormat.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {prompt}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
