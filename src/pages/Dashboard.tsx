import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import {
  Image,
  Video,
  Music,
  Sparkles,
  Download,
  Share2,
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
  Check,
  Trash2,
  Film,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FAL_MODELS, getModelById, getDefaultSettings, getModelsByType, getModelsByTypeGrouped, calculateCaurisCost, type FalModel } from "@/lib/fal-models";

const GENERATE_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
const GENERATE_VIDEO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`;

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

interface GeneratedImage {
  url: string;
  width?: number;
  height?: number;
  prompt?: string;
  resolution?: string;
  timestamp?: number;
}

interface GeneratedVideo {
  url: string;
  prompt?: string;
  timestamp?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { balance, deduct, refetch: refetchCauris } = useCauris();
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [prompt, setPrompt] = useState("");

  const imageModels = getModelsByType("image");
  const videoModels = getModelsByType("video");
  const currentModels = activeTab === "video" ? videoModels : imageModels;

  const [selectedModel, setSelectedModel] = useState<FalModel>(imageModels[0]);
  const [modelSettings, setModelSettings] = useState<Record<string, any>>(getDefaultSettings(imageModels[0]));
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GeneratedVideo[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSelectModel = (model: FalModel) => {
    setSelectedModel(model);
    setModelSettings(getDefaultSettings(model));
    setNumImages(1);
    setShowModelDropdown(false);
  };

  const handleSwitchTab = (tab: "image" | "video" | "audio") => {
    setActiveTab(tab);
    if (tab === "video") {
      setSelectedModel(videoModels[0]);
      setModelSettings(getDefaultSettings(videoModels[0]));
    } else if (tab === "image") {
      setSelectedModel(imageModels[0]);
      setModelSettings(getDefaultSettings(imageModels[0]));
    }
    setNumImages(1);
  };

  const updateSetting = (key: string, value: any) => {
    setModelSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Load history from DB
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) {
        setGalleryImages(
          data.map((g: any) => ({
            url: g.image_url,
            prompt: g.prompt,
            resolution: g.resolution,
            timestamp: new Date(g.created_at).getTime(),
          }))
        );
      }
    };
    loadHistory();
  }, [user]);

  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      setProgressStage("Initialisation...");
      const stages = [
        { at: 10, label: "Analyse du prompt..." },
        { at: 25, label: "Préparation du modèle..." },
        { at: 40, label: "Génération en cours..." },
        { at: 60, label: "Rendu des détails..." },
        { at: 75, label: "Finalisation..." },
        { at: 88, label: "Presque terminé..." },
      ];
      let current = 0;
      progressInterval.current = setInterval(() => {
        current += Math.random() * 3 + 0.5;
        if (current > 92) current = 92;
        setProgress(current);
        const stage = [...stages].reverse().find((s) => current >= s.at);
        if (stage) setProgressStage(stage.label);
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      if (progress > 0) {
        setProgress(100);
        setProgressStage("Terminé !");
        const t = setTimeout(() => setProgress(0), 1000);
        return () => clearTimeout(t);
      }
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isGenerating]);

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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanceUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`;
      const resp = await fetch(enhanceUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ prompt, model_id: selectedModel.id }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      const data = await resp.json();
      if (data.enhanced_prompt) {
        setPrompt(data.enhanced_prompt);
        toast.success("Prompt amélioré ✨");
      }
    } catch (e: any) {
      console.error("Enhance error:", e);
      toast.error(e.message || "Erreur lors de l'amélioration");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings, numImages);
    if (balance < cost) {
      toast.error(`Solde insuffisant ! Il vous faut ${cost} cauris. Rechargez votre compte.`);
      return;
    }
    setIsGenerating(true);

    try {
      // Get user's auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Build payload with model-specific settings
      const cleanSettings: Record<string, any> = {};
      for (const [key, value] of Object.entries(modelSettings)) {
        if (value === "" || value === undefined || value === null) continue;
        if (key === "seed" && value === 0) continue;
        cleanSettings[key] = value;
      }

      const payload: Record<string, any> = {
        prompt,
        model_id: selectedModel.id,
        num_images: Math.min(numImages, selectedModel.maxImages || 1),
        output_format: "png",
        ...cleanSettings,
      };
      if (referenceImage && selectedModel.supportsImageInput) {
        payload.image_url = referenceImage;
      }

      const resp = await fetch(GENERATE_IMAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
            resolution: modelSettings.resolution || modelSettings.image_size || "",
            timestamp: Date.now(),
          });
        });
      } else if (data.image_url) {
        newImages.push({ url: data.image_url, prompt, timestamp: Date.now() });
      } else {
        throw new Error("Aucune image retournée");
      }

      setGalleryImages((prev) => [...newImages, ...prev]);
      // Deduct cauris after success
      await deduct(cost);
      refetchCauris();
    } catch (e: any) {
      console.error("Generation error:", e);
      toast.error(e.message || "Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings);
    if (balance < cost) {
      toast.error(`Solde insuffisant ! Il vous faut ${cost} cauris. Rechargez votre compte.`);
      return;
    }
    setIsGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const cleanSettings: Record<string, any> = {};
      for (const [key, value] of Object.entries(modelSettings)) {
        if (value === "" || value === undefined || value === null) continue;
        if (key === "seed" && value === 0) continue;
        cleanSettings[key] = value;
      }

      const payload: Record<string, any> = {
        prompt,
        model_id: selectedModel.id,
        ...cleanSettings,
      };
      if (referenceImage && selectedModel.supportsImageInput) {
        payload.image_url = referenceImage;
      }

      const resp = await fetch(GENERATE_VIDEO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur inconnue" }));
        throw new Error(err.error || `Erreur ${resp.status}`);
      }

      const data = await resp.json();
      if (data.video_url) {
        setGalleryVideos((prev) => [
          { url: data.video_url, prompt, timestamp: Date.now() },
          ...prev,
        ]);
        toast.success("Vidéo générée !");
        await deduct(cost);
        refetchCauris();
      } else {
        throw new Error("Aucune vidéo retournée");
      }
    } catch (e: any) {
      console.error("Video generation error:", e);
      toast.error(e.message || "Erreur lors de la génération vidéo");
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

  const handleDeleteImage = async (img: GeneratedImage) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("generations")
        .delete()
        .eq("user_id", user.id)
        .eq("image_url", img.url);
      if (error) throw error;
      setGalleryImages((prev) => prev.filter((g) => g.url !== img.url));
      setPreviewImage(null);
      toast.success("Image supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleImageToVideo = (img: GeneratedImage) => {
    // Switch to video tab with the image as reference
    const i2vModels = getModelsByType("video").filter((m) => m.supportsImageInput);
    if (i2vModels.length === 0) return;
    setActiveTab("video");
    setSelectedModel(i2vModels[0]);
    setModelSettings(getDefaultSettings(i2vModels[0]));
    setReferenceImage(img.url);
    setReferencePreview(img.url);
    if (img.prompt) setPrompt(img.prompt);
    setPreviewImage(null);
    toast.success("Image chargée dans le générateur vidéo !");
  };

  // Render a single setting control
  const renderSetting = (setting: typeof selectedModel.settings[0]) => {
    const value = modelSettings[setting.key];

    if (setting.type === "select") {
      return (
        <div key={setting.key} className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {setting.label}
          </label>
          <div className="flex flex-wrap gap-1">
            {setting.options?.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting(setting.key, opt.value)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  value === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (setting.type === "slider") {
      return (
        <div key={setting.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {setting.label}
            </label>
            <span className="text-[11px] text-primary font-bold">{value}</span>
          </div>
          <Slider
            value={[value]}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onValueChange={([v]) => updateSetting(setting.key, v)}
            className="w-full"
          />
        </div>
      );
    }

    if (setting.type === "toggle") {
      return (
        <div key={setting.key} className="flex items-center justify-between">
          <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {setting.label}
          </label>
          <button
            onClick={() => updateSetting(setting.key, !value)}
            className={`w-8 h-5 rounded-full transition-colors flex items-center ${
              value ? "bg-primary justify-end" : "bg-white/[0.1] justify-start"
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white mx-0.5" />
          </button>
        </div>
      );
    }

    if (setting.type === "text") {
      return (
        <div key={setting.key} className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {setting.label}
          </label>
          {setting.description && (
            <p className="text-[9px] text-muted-foreground/60">{setting.description}</p>
          )}
          <input
            type="text"
            value={value || ""}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.description || ""}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ===== LEFT SIDEBAR ===== */}
      <div className="w-72 min-w-[288px] border-r border-white/[0.06] bg-white/[0.02] flex flex-col overflow-y-auto">
        <div className="p-4 space-y-4 flex-1">
          {/* Tabs: Image / Video / Audio */}
          <div className="flex rounded-xl bg-white/[0.04] p-1">
           {(["image", "video", "audio"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleSwitchTab(tab)}
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

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Modèle
            </label>
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full flex items-center gap-2 glass glass-hover rounded-xl px-3 py-2.5"
              >
                <div
                  className={`w-6 h-6 rounded-lg bg-gradient-to-br ${selectedModel.color} flex items-center justify-center text-xs`}
                >
                  {selectedModel.icon}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-foreground block leading-tight">
                    {selectedModel.brand} — {selectedModel.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {selectedModel.description}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    showModelDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 right-0 top-full mt-1 glass-card p-1.5 z-50 max-h-[400px] overflow-y-auto"
                  >
                    {getModelsByTypeGrouped(activeTab === "video" ? "video" : "image").map((group) => (
                      <div key={group.brand} className="mb-1.5">
                        <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                          {group.brand}
                        </div>
                        {group.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleSelectModel(model)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                              selectedModel.id === model.id
                                ? "bg-primary/10"
                                : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded bg-gradient-to-br ${model.color} flex items-center justify-center text-[10px] shrink-0`}
                            >
                              {model.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground block truncate">
                                {model.name}
                              </span>
                              <span className="text-[9px] text-muted-foreground block truncate">
                                {model.description}
                              </span>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Model-Specific Settings */}
          <div className="space-y-3">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Réglages — {selectedModel.brand} {selectedModel.name}
            </label>
            <div className="space-y-3">
              {selectedModel.settings.map((setting) => renderSetting(setting))}
            </div>
          </div>

          {/* References */}
          {selectedModel.supportsImageInput && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Référence
                </label>
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
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                Prompt
              </label>
              <button
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Améliorer le prompt avec l'IA"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                {isEnhancing ? "Amélioration..." : "Améliorer"}
              </button>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez votre image..."
              className="min-h-[100px] bg-white/[0.03] border border-white/[0.06] rounded-xl resize-none text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          {/* Number of images */}
          {(selectedModel.maxImages || 1) > 1 && (
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Nombre d'images
              </label>
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
                  onClick={() => setNumImages(Math.min(selectedModel.maxImages || 1, numImages + 1))}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={activeTab === "video" ? handleGenerateVideo : handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-generate w-full flex items-center justify-between text-sm disabled:opacity-50 disabled:animate-none"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2 mx-auto">
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </span>
            ) : (
              <>
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Générer
                </span>
                <span className="bg-black/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                  {calculateCaurisCost(selectedModel, modelSettings, numImages)} cauris
                </span>
              </>
            )}
          </button>

          {/* Balance indicator */}
          <div className="text-center">
            <span className="text-[11px] text-muted-foreground">
              Il vous reste <span className="font-bold text-foreground">{balance}</span> cauris
              {balance < calculateCaurisCost(selectedModel, modelSettings, numImages) && (
                <> · <a href="/pricing" className="text-primary underline underline-offset-2 font-semibold">Recharger</a></>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT GALLERY ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
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

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "video" ? (
            /* ===== VIDEO GALLERY ===== */
            galleryVideos.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Video className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vos vidéos apparaîtront ici</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Choisissez un modèle vidéo, entrez un prompt et cliquez sur Générer</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isGenerating && (
                  <motion.div
                    key="video-loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center p-4 space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 animate-pulse" style={{ background: `linear-gradient(135deg, transparent 30%, hsl(var(--primary) / 0.04) 50%, transparent 70%)` }} />
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-white/[0.08] border-t-primary animate-spin" />
                    </div>
                    <div className="relative w-full space-y-2 px-2">
                      <p className="text-xs text-muted-foreground text-center font-medium">{progressStage}</p>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className="h-full rounded-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                      </div>
                      <p className="text-[10px] text-primary font-bold text-center">{Math.round(progress)}%</p>
                    </div>
                  </motion.div>
                )}
                {galleryVideos.map((vid, i) => (
                  <motion.div
                    key={`vid-${i}-${vid.timestamp}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video relative group rounded-xl overflow-hidden"
                  >
                    <video
                      src={vid.url}
                      controls
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownload(vid.url, i)}
                        className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    {vid.prompt && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white/80 truncate">{vid.prompt}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* ===== IMAGE GALLERY ===== */
            galleryImages.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vos créations apparaîtront ici</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Choisissez un modèle, entrez un prompt et cliquez sur Générer</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {isGenerating &&
                  Array.from({ length: numImages }).map((_, i) => (
                    <motion.div
                      key={`loading-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-square rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center p-4 space-y-4 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 animate-pulse" style={{ background: `linear-gradient(135deg, transparent 30%, hsl(var(--primary) / 0.04) 50%, transparent 70%)` }} />
                      </div>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-white/[0.08] border-t-primary animate-spin" />
                      </div>
                      <div className="relative w-full space-y-2 px-2">
                        <p className="text-xs text-muted-foreground text-center font-medium">{progressStage}</p>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div className="h-full rounded-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                        </div>
                        <p className="text-[10px] text-primary font-bold text-center">{Math.round(progress)}%</p>
                      </div>
                    </motion.div>
                  ))}
                {galleryImages.map((img, i) => (
                  <motion.div
                    key={`img-${i}-${img.timestamp}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setPreviewImage(img)}
                    className="aspect-square relative group rounded-xl overflow-hidden cursor-pointer"
                  >
                    <img src={img.url} alt={img.prompt || "Generated"} className="w-full h-full object-cover rounded-xl" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                        <span className="text-[10px] text-white/80 font-medium">{img.resolution || ""}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img);
                            }}
                            className="w-7 h-7 rounded-lg bg-red-500/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(img.url, i); }}
                            className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* ===== IMAGE PREVIEW MODAL ===== */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage.url}
                alt={previewImage.prompt || "Preview"}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {previewImage.prompt && (
                  <p className="text-sm text-white/70 max-w-md truncate">{previewImage.prompt}</p>
                )}
                <button
                  onClick={() => handleDownload(previewImage.url, 0)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={() => handleImageToVideo(previewImage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
                >
                  <Film className="w-4 h-4" />
                  Animer en vidéo
                </button>
                <button
                  onClick={async () => {
                    if (!user || !previewImage) return;
                    try {
                      const { error } = await supabase
                        .from("generations")
                        .update({ is_public: true, creator_name: user.email?.split("@")[0] || "Artiste" })
                        .eq("user_id", user.id)
                        .eq("image_url", previewImage.url);
                      if (error) throw error;
                      toast.success("Image partagée avec la communauté !");
                    } catch (e: any) {
                      toast.error("Erreur lors du partage");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent text-sm font-semibold hover:bg-accent/30 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
                <button
                  onClick={() => handleDeleteImage(previewImage)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
