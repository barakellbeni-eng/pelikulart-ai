import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Image,
  Video,
  Music,
  Sparkles,
  Download,
  Loader2,
  Upload,
  X,
  Plus,
  Minus,
  ChevronDown,
  User,
  Wand2,
  Grid3X3,
  LayoutGrid,
  Search,
  Heart,
  SlidersHorizontal,
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

const aspectRatioOptions: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "5:4", label: "5:4" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "21:9", label: "21:9" },
  { value: "auto", label: "Auto" },
];

const resolutionOptions: Resolution[] = ["1K", "2K", "4K"];

interface GeneratedImage {
  url: string;
  width?: number;
  height?: number;
  prompt?: string;
  resolution?: string;
  timestamp?: number;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("4:5");
  const [resolution, setResolution] = useState<Resolution>("2K");
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
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
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const payload: Record<string, any> = {
        prompt,
        aspect_ratio: aspectRatio,
        resolution,
        output_format: "png",
        num_images: numImages,
      };
      if (referenceImage) {
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
      const newImages: GeneratedImage[] = [];

      if (data.images?.length) {
        data.images.forEach((img: any) => {
          newImages.push({
            url: img.url,
            width: img.width,
            height: img.height,
            prompt,
            resolution,
            timestamp: Date.now(),
          });
        });
      } else if (data.image_url) {
        newImages.push({ url: data.image_url, prompt, resolution, timestamp: Date.now() });
      } else {
        throw new Error("Aucune image retournée");
      }

      setGalleryImages((prev) => [...newImages, ...prev]);
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
      a.download = `afrikaart-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ===== LEFT SIDEBAR ===== */}
      <div className="w-72 min-w-[288px] border-r border-white/[0.06] bg-white/[0.02] flex flex-col overflow-y-auto">
        <div className="p-4 space-y-5 flex-1">
          {/* Tabs: Image / Video / Audio */}
          <div className="flex rounded-xl bg-white/[0.04] p-1">
            {(["image", "video", "audio"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "image" && <Image className="w-3.5 h-3.5" />}
                {tab === "video" && <Video className="w-3.5 h-3.5" />}
                {tab === "audio" && <Music className="w-3.5 h-3.5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Model
            </label>
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-[10px] font-bold text-white">
                G
              </div>
              <span className="text-sm font-medium text-foreground flex-1">
                Nano Banana Pro
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* References */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                References
              </label>
              <button className="text-xs text-primary font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleBoost}
                className="flex flex-col items-center gap-1.5 glass glass-hover rounded-xl p-3"
              >
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-[10px] text-muted-foreground font-medium">Style</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 glass glass-hover rounded-xl p-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">Character</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 glass glass-hover rounded-xl p-3"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">Upload</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Reference preview */}
            <AnimatePresence>
              {referencePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <img
                    src={referencePreview}
                    alt="Référence"
                    className="w-full rounded-xl border border-white/[0.08] max-h-32 object-cover"
                  />
                  <button
                    onClick={removeReferenceImage}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your image"
              className="min-h-[120px] bg-white/[0.03] border border-white/[0.06] rounded-xl resize-none text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          {/* Controls Row */}
          <div className="flex items-center gap-2">
            {/* Number */}
            <div className="flex items-center gap-0 glass rounded-lg">
              <button
                onClick={() => setNumImages(Math.max(1, numImages - 1))}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-semibold text-foreground w-5 text-center">
                {numImages}
              </span>
              <button
                onClick={() => setNumImages(Math.min(4, numImages + 1))}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Aspect Ratio */}
            <div className="relative">
              <button
                onClick={() => setShowAspectDropdown(!showAspectDropdown)}
                className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground"
              >
                <div className="w-3 h-3.5 border border-current rounded-[2px]" />
                {aspectRatio}
              </button>
              <AnimatePresence>
                {showAspectDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full left-0 mb-1 glass-card p-1.5 z-50 min-w-[120px]"
                  >
                    {aspectRatioOptions.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => {
                          setAspectRatio(ar.value);
                          setShowAspectDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          aspectRatio === ar.value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resolution */}
            <div className="flex items-center gap-0 glass rounded-lg">
              {resolutionOptions.map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-2 py-1.5 text-xs font-semibold transition-colors rounded-md ${
                    resolution === res
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-generate w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:animate-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate
                <Wand2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== RIGHT GALLERY ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Gallery Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {galleryImages.length > 0
                ? `${galleryImages.length} image${galleryImages.length > 1 ? "s" : ""}`
                : "Gallery"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {galleryImages.length === 0 && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                <Image className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vos créations apparaîtront ici
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Entrez un prompt et cliquez sur Generate
                </p>
              </div>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
              {/* Loading placeholders */}
              {isGenerating &&
                Array.from({ length: numImages }).map((_, i) => (
                  <div
                    key={`loading-${i}`}
                    className="break-inside-avoid skeleton-ad rounded-xl aspect-[4/5]"
                  />
                ))}

              {/* Generated Images */}
              {galleryImages.map((img, i) => (
                <motion.div
                  key={`img-${i}-${img.timestamp}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={img.url}
                    alt={img.prompt || "Generated"}
                    className="w-full rounded-xl"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-[8px] font-bold text-white">
                          G
                        </div>
                        <span className="text-[10px] text-white/80 font-medium">
                          {img.resolution || "2K"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(img.url, i);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
