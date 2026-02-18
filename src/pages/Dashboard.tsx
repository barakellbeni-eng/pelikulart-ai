import { useState, useRef, useEffect, useSyncExternalStore, useCallback } from "react";
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
  RefreshCw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FAL_MODELS, getModelById, getDefaultSettings, getModelsByType, getModelsByTypeGrouped, calculateCaurisCost, type FalModel } from "@/lib/fal-models";
import HourglassLoader from "@/components/HourglassLoader";
import { getGenerationJob, startGeneration, completeGeneration, failGeneration, subscribeGeneration } from "@/hooks/useGenerationStore";

const GENERATE_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
const GENERATE_VIDEO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`;
const GENERATE_AUDIO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audio`;

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
  modelId?: string;
  modelSettings?: Record<string, any>;
  caurisCost?: number;
  numImages?: number;
}

interface GeneratedVideo {
  url: string;
  prompt?: string;
  timestamp?: number;
}

interface GeneratedAudio {
  url: string;
  prompt?: string;
  timestamp?: number;
  modelId?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { balance, deduct, refetch: refetchCauris } = useCauris();
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [prompt, setPrompt] = useState("");

  const imageModels = getModelsByType("image");
  const videoModels = getModelsByType("video");
  const audioModels = getModelsByType("audio");
  const currentModels = activeTab === "video" ? videoModels : activeTab === "audio" ? audioModels : imageModels;

  const [selectedModel, setSelectedModel] = useState<FalModel>(imageModels[0]);
  const [modelSettings, setModelSettings] = useState<Record<string, any>>(getDefaultSettings(imageModels[0]));
  const [numImages, setNumImages] = useState(1);
  const generationJob = useSyncExternalStore(subscribeGeneration, getGenerationJob);
  const isGenerating = generationJob?.status === "pending";
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GeneratedVideo[]>([]);
  const [galleryAudios, setGalleryAudios] = useState<GeneratedAudio[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");

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
    } else if (tab === "audio") {
      setSelectedModel(audioModels[0]);
      setModelSettings(getDefaultSettings(audioModels[0]));
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

  // No more fake progress — just show hourglass while generating

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
    startGeneration("image", prompt, numImages);

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
      const cost = calculateCaurisCost(selectedModel, modelSettings, numImages);

      if (data.images?.length) {
        data.images.forEach((img: any) => {
          newImages.push({
            url: img.url,
            width: img.width,
            height: img.height,
            prompt,
            resolution: modelSettings.resolution || modelSettings.image_size || "",
            timestamp: Date.now(),
            modelId: selectedModel.id,
            modelSettings: { ...modelSettings },
            caurisCost: cost,
            numImages,
          });
        });
      } else if (data.image_url) {
        newImages.push({ url: data.image_url, prompt, timestamp: Date.now(), modelId: selectedModel.id, modelSettings: { ...modelSettings }, caurisCost: cost, numImages });
      } else {
        throw new Error("Aucune image retournée");
      }

      setGalleryImages((prev) => [...newImages, ...prev]);
      await deduct(cost);
      refetchCauris();
      completeGeneration();
    } catch (e: any) {
      console.error("Generation error:", e);
      toast.error(e.message || "Erreur lors de la génération");
      failGeneration(e.message);
    } finally {
      if (getGenerationJob()?.status === "pending") completeGeneration();
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings);
    if (balance < cost) {
      toast.error(`Solde insuffisant ! Il vous faut ${cost} cauris. Rechargez votre compte.`);
      return;
    }
    startGeneration("video", prompt);
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
        completeGeneration();
      } else {
        throw new Error("Aucune vidéo retournée");
      }
    } catch (e: any) {
      console.error("Video generation error:", e);
      toast.error(e.message || "Erreur lors de la génération vidéo");
      failGeneration(e.message);
    } finally {
      if (getGenerationJob()?.status === "pending") completeGeneration();
    }
  };

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings);
    if (balance < cost) {
      toast.error(`Solde insuffisant ! Il vous faut ${cost} cauris.`);
      return;
    }
    startGeneration("audio", prompt);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const cleanSettings: Record<string, any> = {};
      for (const [key, value] of Object.entries(modelSettings)) {
        if (value === "" || value === undefined || value === null) continue;
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

      const resp = await fetch(GENERATE_AUDIO_URL, {
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
      if (data.audio_url) {
        setGalleryAudios((prev) => [
          { url: data.audio_url, prompt, timestamp: Date.now(), modelId: selectedModel.id },
          ...prev,
        ]);
        toast.success("Audio généré !");
        await deduct(cost);
        refetchCauris();
        completeGeneration();
      } else {
        throw new Error("Aucun audio retourné");
      }
    } catch (e: any) {
      console.error("Audio generation error:", e);
      toast.error(e.message || "Erreur lors de la génération audio");
      failGeneration(e.message);
    } finally {
      if (getGenerationJob()?.status === "pending") completeGeneration();
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

  const handleRecreateImage = (img: GeneratedImage) => {
    if (img.prompt) setPrompt(img.prompt);
    if (img.modelId) {
      const model = getModelById(img.modelId);
      if (model) {
        setActiveTab("image");
        setSelectedModel(model);
        setModelSettings(img.modelSettings || getDefaultSettings(model));
      }
    }
    setPreviewImage(null);
    toast.success("Paramètres restaurés, prêt à recréer !");
  };

  // Render a single setting control
  const renderSetting = (setting: typeof selectedModel.settings[0]) => {
    const value = modelSettings[setting.key];

    if (setting.type === "select") {
      const isRatioOrSize = setting.key === "aspect_ratio" || setting.key === "image_size";
      const selectedOpt = setting.options?.find((o) => o.value === value);

      if (isRatioOrSize && setting.options && setting.options.length > 4) {
        // Helper to render a proportional frame icon for a ratio
        const RatioFrame = ({ ratio, className = "" }: { ratio: string; className?: string }) => {
          const dims: Record<string, { w: number; h: number }> = {
            "16:9": { w: 20, h: 11 }, "9:16": { w: 11, h: 20 },
            "1:1": { w: 16, h: 16 }, "4:3": { w: 18, h: 14 },
            "3:4": { w: 14, h: 18 }, "4:5": { w: 14, h: 18 },
            "3:2": { w: 18, h: 12 }, "2:3": { w: 12, h: 18 },
            "21:9": { w: 22, h: 9 },
          };
          const d = dims[ratio] || { w: 16, h: 16 };
          return (
            <span className={`inline-flex items-center justify-center ${className}`} style={{ width: 24, height: 24 }}>
              <span
                className="border-[1.5px] border-current rounded-[2px]"
                style={{ width: d.w, height: d.h }}
              />
            </span>
          );
        };

        return (
          <div key={setting.key} className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {setting.label}
            </label>
            <div className="grid grid-cols-1 gap-1">
              {setting.options.map((opt) => {
                const ratioValue = opt.value.match(/\d+:\d+/) ? opt.value : "";
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting(setting.key, opt.value)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all text-left ${
                      isSelected
                        ? "glass ring-1 ring-primary/60 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {ratioValue && <RatioFrame ratio={ratioValue} className={isSelected ? "text-primary" : "text-muted-foreground"} />}
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-auto text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

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
                className="w-full flex items-center gap-2.5 glass glass-hover rounded-xl px-3 py-2.5"
              >
                <span className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 uppercase">
                  {selectedModel.brand.slice(0, 2)}
                </span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-foreground block leading-tight">
                    {selectedModel.brand} {selectedModel.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {selectedModel.description}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary mr-1">{calculateCaurisCost(selectedModel, modelSettings, numImages)} c</span>
                <span className="text-[9px] text-muted-foreground mr-1">⏱ {selectedModel.estimatedTime}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    showModelDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="fixed left-[288px] top-[120px] w-72 bg-card border border-white/[0.08] rounded-xl p-1 z-[100] max-h-[70vh] overflow-y-auto shadow-2xl"
                  >
                    {getModelsByTypeGrouped(activeTab === "video" ? "video" : activeTab === "audio" ? "audio" : "image").map((group) => (
                      <div key={group.brand}>
                        <div className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 sticky top-0 bg-card z-10">
                          {group.brand}
                        </div>
                        {group.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => handleSelectModel(model)}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                              selectedModel.id === model.id
                                ? "bg-primary/10"
                                : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className="w-5 h-5 rounded bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 uppercase">
                              {model.brand.slice(0, 2)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground block truncate">
                                {model.brand} {model.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] text-muted-foreground/60">⏱ {model.estimatedTime}</span>
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {model.caurisCost}c
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
            onClick={activeTab === "video" ? handleGenerateVideo : activeTab === "audio" ? handleGenerateAudio : handleGenerate}
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
              {activeTab === "audio"
                ? galleryAudios.length > 0 ? `${galleryAudios.length} audio${galleryAudios.length > 1 ? "s" : ""}` : "Gallery"
                : activeTab === "video"
                ? galleryVideos.length > 0 ? `${galleryVideos.length} vidéo${galleryVideos.length > 1 ? "s" : ""}` : "Gallery"
                : galleryImages.length > 0 ? `${galleryImages.length} image${galleryImages.length > 1 ? "s" : ""}` : "Gallery"}
            </span>
          </div>
          <div className="flex items-center gap-1 glass rounded-lg p-0.5">
            <button
              onClick={() => setGridSize("small")}
              className={`p-1.5 rounded-md transition-colors ${gridSize === "small" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Petite grille"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridSize("medium")}
              className={`p-1.5 rounded-md transition-colors ${gridSize === "medium" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Grille moyenne"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridSize("large")}
              className={`p-1.5 rounded-md transition-colors ${gridSize === "large" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Grande grille"
            >
              <Image className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "audio" ? (
            /* ===== AUDIO GALLERY ===== */
            galleryAudios.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <Music className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vos audios apparaîtront ici</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Choisissez un modèle audio, entrez un prompt et cliquez sur Générer</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 ${gridSize === "small" ? "grid-cols-1 md:grid-cols-3" : gridSize === "large" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                {isGenerating && (
                  <motion.div
                    key="audio-loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center p-6 space-y-3"
                  >
                    <HourglassLoader size={28} />
                  </motion.div>
                )}
                {galleryAudios.map((aud, i) => {
                  const model = aud.modelId ? getModelById(aud.modelId) : null;
                  return (
                    <motion.div
                      key={`aud-${i}-${aud.timestamp}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        {model && (
                          <span className="w-5 h-5 rounded bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase">
                            {model.brand.slice(0, 2)}
                          </span>
                        )}
                        <span className="text-xs font-medium text-foreground truncate flex-1">
                          {aud.prompt}
                        </span>
                        <button
                          onClick={() => handleDownload(aud.url, i)}
                          className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <audio src={aud.url} controls className="w-full h-8" />
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : activeTab === "video" ? (
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
              <div className={`grid gap-4 ${gridSize === "small" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : gridSize === "large" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                {isGenerating && (
                  <motion.div
                    key="video-loading"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center p-4 space-y-3"
                  >
                    <HourglassLoader size={28} />
                  </motion.div>
                )}
                {galleryVideos.map((vid, i) => (
                  <motion.div
                    key={`vid-${i}-${vid.timestamp}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video relative group rounded-xl overflow-hidden"
                  >
                    <video src={vid.url} controls className="w-full h-full object-cover rounded-xl" />
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
              <div className={`grid gap-3 ${gridSize === "small" ? "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8" : gridSize === "large" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
                {isGenerating &&
                  Array.from({ length: numImages }).map((_, i) => (
                    <motion.div
                      key={`loading-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-square rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center p-4 space-y-3"
                    >
                      <HourglassLoader size={24} />
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
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleImageToVideo(img); }}
                          className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                          title="Animer en vidéo"
                        >
                          <Film className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRecreateImage(img); }}
                          className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                          title="Recréer"
                        >
                          <RefreshCw className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                        <span className="text-[10px] text-white/80 font-medium">{img.resolution || ""}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(img); }}
                            className="w-7 h-7 rounded-lg bg-destructive/20 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
                className="max-w-full max-h-[65vh] object-contain rounded-xl"
              />

              {/* Model details */}
              {previewImage.modelId && (() => {
                const model = getModelById(previewImage.modelId);
                return model ? (
                  <div className="w-full max-w-md glass rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{model.icon}</span>
                      <span className="text-sm font-bold text-foreground">{model.brand} {model.name}</span>
                      {previewImage.caurisCost && (
                        <span className="ml-auto text-xs font-bold text-primary">{previewImage.caurisCost} cauris</span>
                      )}
                    </div>
                    {previewImage.modelSettings && (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(previewImage.modelSettings).map(([key, val]) => {
                          if (val === "" || val === undefined || val === null || val === false) return null;
                          const setting = model.settings.find(s => s.key === key);
                          const label = setting?.label || key;
                          const displayVal = val === true ? "Oui" : String(val);
                          return (
                            <span key={key} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-muted-foreground">
                              {label}: <span className="text-foreground font-medium">{displayVal}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              {previewImage.prompt && (
                <p className="text-sm text-white/70 max-w-md truncate">{previewImage.prompt}</p>
              )}

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => handleDownload(previewImage.url, 0)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={() => handleImageToVideo(previewImage)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] text-foreground text-sm font-semibold hover:bg-white/[0.12] transition-colors"
                >
                  <Film className="w-4 h-4" />
                  Animer
                </button>
                <button
                  onClick={() => handleRecreateImage(previewImage)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] text-foreground text-sm font-semibold hover:bg-white/[0.12] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recréer
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
                    } catch {
                      toast.error("Erreur lors du partage");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.08] text-foreground text-sm font-semibold hover:bg-white/[0.12] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Partager
                </button>
                <button
                  onClick={() => handleDeleteImage(previewImage)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/20 text-destructive text-sm font-semibold hover:bg-destructive/30 transition-colors"
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
