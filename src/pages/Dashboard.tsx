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
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [openRatioDropdown, setOpenRatioDropdown] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDescribingImage, setIsDescribingImage] = useState(false);
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium");
  const describeInputRef = useRef<HTMLInputElement>(null);

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
    const maxInput = selectedModel.maxInputImages || 1;
    if (referenceImages.length >= maxInput) {
      toast.error(`Maximum ${maxInput} images pour ce modèle`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setReferenceImages((prev) => [...prev, dataUrl]);
      setReferencePreviews((prev) => [...prev, dataUrl]);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeReferenceImage = (index?: number) => {
    if (index !== undefined) {
      setReferenceImages((prev) => prev.filter((_, i) => i !== index));
      setReferencePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      setReferenceImages([]);
      setReferencePreviews([]);
    }
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

  const handleDescribeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo");
      return;
    }
    setIsDescribingImage(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const describeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/describe-image`;
      const resp = await fetch(describeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ image_base64: base64 }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur");
      }
      const data = await resp.json();
      if (data.description) {
        setPrompt((prev) => (prev ? `${prev}\n\n${data.description}` : data.description));
        toast.success("Image convertie en prompt ✨");
      }
    } catch (e: any) {
      console.error("Describe image error:", e);
      toast.error(e.message || "Erreur lors de la description");
    } finally {
      setIsDescribingImage(false);
      if (describeInputRef.current) describeInputRef.current.value = "";
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
      if (referenceImages.length > 0 && selectedModel.supportsImageInput) {
        if ((selectedModel.maxInputImages || 1) > 1) {
          payload.image_urls = referenceImages;
        } else {
          payload.image_url = referenceImages[0];
        }
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
      if (referenceImages.length > 0 && selectedModel.supportsImageInput) {
        payload.image_url = referenceImages[0];
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
      if (referenceImages.length > 0 && selectedModel.supportsImageInput) {
        payload.image_url = referenceImages[0];
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
    setReferenceImages([img.url]);
    setReferencePreviews([img.url]);
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
      const isRatioOrSize = setting.key === "aspect_ratio" || setting.key === "image_size" || setting.key === "resolution";
      const selectedOpt = setting.options?.find((o) => o.value === value);

      if (isRatioOrSize && setting.options) {
        // Helper to render a proportional frame icon for a ratio, or a resolution icon
        const RatioFrame = ({ ratio, className = "" }: { ratio: string; className?: string }) => {
          // Resolution values get a simple box icon
          const isResolution = /^\d+[Kk]$|^\d+p$/.test(ratio);
          if (isResolution) {
            return (
              <span className={`inline-flex items-center justify-center ${className}`} style={{ width: 24, height: 24 }}>
                <span className="border-[1.5px] border-current rounded-[2px] flex items-center justify-center" style={{ width: 18, height: 14 }}>
                  <span className="text-[7px] font-bold leading-none">{ratio.replace(/p$/, '')}</span>
                </span>
              </span>
            );
          }
          const dims: Record<string, { w: number; h: number }> = {
            "16:9": { w: 20, h: 11 }, "9:16": { w: 11, h: 20 },
            "1:1": { w: 16, h: 16 }, "4:3": { w: 18, h: 14 },
            "3:4": { w: 14, h: 18 }, "4:5": { w: 14, h: 18 },
            "5:4": { w: 18, h: 14 }, "3:2": { w: 18, h: 12 },
            "2:3": { w: 12, h: 18 }, "21:9": { w: 22, h: 9 },
            "square_hd": { w: 16, h: 16 }, "square": { w: 16, h: 16 },
            "portrait_4_3": { w: 14, h: 18 }, "portrait_16_9": { w: 11, h: 20 },
            "landscape_4_3": { w: 18, h: 14 }, "landscape_16_9": { w: 20, h: 11 },
            "1024x1024": { w: 16, h: 16 }, "1365x1024": { w: 20, h: 15 },
            "1024x1365": { w: 15, h: 20 }, "1536x1024": { w: 20, h: 13 },
            "1024x1536": { w: 13, h: 20 },
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

        const ratioDropdownId = `ratio-dropdown-${setting.key}`;

        return (
          <div key={setting.key} className="relative">
            <button
              onClick={() => setOpenRatioDropdown(openRatioDropdown === ratioDropdownId ? null : ratioDropdownId)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md glass text-[11px] font-medium text-foreground hover:bg-muted/40 transition-all"
            >
              <RatioFrame ratio={value} className="text-primary" />
              <span>{selectedOpt?.label?.split(" — ")[0] || value}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${openRatioDropdown === ratioDropdownId ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {openRatioDropdown === ratioDropdownId && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 bottom-full left-0 mb-1 min-w-[200px] rounded-lg glass border border-border/50 shadow-xl py-1 backdrop-blur-xl"
                >
                  {setting.options.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          updateSetting(setting.key, opt.value);
                          setOpenRatioDropdown(null);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-medium transition-all text-left ${
                          isSelected
                            ? "text-foreground bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <RatioFrame ratio={opt.value} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 ml-auto text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
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
      <div className="w-72 min-w-[288px] max-w-[288px] shrink-0 border-r border-white/[0.06] bg-white/[0.02] flex flex-col overflow-hidden">
        <div className="p-4 space-y-4 flex-1 overflow-y-auto min-h-0">
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {selectedModel.brand} {selectedModel.name}
                    </span>
                    {selectedModel.recommended && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        ★
                      </span>
                    )}
                  </div>
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
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-foreground truncate">
                                  {model.brand} {model.name}
                                </span>
                                {model.recommended && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                    Populaire
                                  </span>
                                )}
                              </div>
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

          {/* Model-Specific Settings (exclude ratio/resolution/image_size — shown below prompt) */}
          <div className="space-y-3">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Réglages — {selectedModel.brand} {selectedModel.name}
            </label>
            <div className="space-y-3">
              {selectedModel.settings
                .filter((s) => s.key !== "aspect_ratio" && s.key !== "image_size" && s.key !== "resolution")
                .map((setting) => renderSetting(setting))}
            </div>
          </div>

          {/* Image Reference (only for image-to-image models) */}
          {selectedModel.supportsImageInput && (
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Images source ({referencePreviews.length}/{selectedModel.maxInputImages || 1})</span>
                {referencePreviews.length > 0 && (
                  <button onClick={() => removeReferenceImage()} className="text-[10px] text-destructive hover:underline">
                    Tout supprimer
                  </button>
                )}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="grid grid-cols-3 gap-2">
                {referencePreviews.map((preview, idx) => (
                  <motion.div
                    key={`img-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.08] group"
                  >
                    <img
                      src={preview}
                      alt={`@img${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                      <span className="text-[10px] font-mono text-white/90">@img{idx + 1}</span>
                    </div>
                    <button
                      onClick={() => removeReferenceImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
                {referencePreviews.length < (selectedModel.maxInputImages || 1) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-primary/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground font-medium">Upload</span>
                  </motion.button>
                )}
              </div>
              {referencePreviews.length === 0 && (
                <span className="text-[9px] text-muted-foreground/50">PNG, JPG — max 10 Mo par image</span>
              )}
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Prompt
            </label>
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) setPrompt(e.target.value);
                }}
                maxLength={2000}
                placeholder="Décrivez votre image en détail : sujet, style, couleurs, lumière, ambiance..."
                className="min-h-[200px] max-h-[360px] overflow-y-auto bg-white/[0.03] border border-white/[0.06] rounded-xl resize-y text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30 pb-10 pr-3"
              />
              {/* Bottom bar inside textarea */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1 pointer-events-auto">
                  {/* Image → Texte */}
                  <button
                    onClick={() => describeInputRef.current?.click()}
                    disabled={isDescribingImage}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm border border-white/[0.06]"
                    title="Image → Texte : convertir une image en prompt"
                  >
                    {isDescribingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Image className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    ref={describeInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDescribeImage}
                  />
                  {/* Améliorer */}
                  <button
                    onClick={handleEnhancePrompt}
                    disabled={!prompt.trim() || isEnhancing}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed backdrop-blur-sm border border-white/[0.06]"
                    title="Améliorer le prompt avec l'IA"
                  >
                    {isEnhancing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {/* Effacer */}
                  {prompt.length > 0 && (
                    <button
                      onClick={() => setPrompt("")}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition-all backdrop-blur-sm border border-white/[0.06]"
                      title="Effacer le prompt"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className={`pointer-events-auto text-[10px] font-medium tabular-nums ${prompt.length > 1800 ? "text-red-400" : prompt.length > 1400 ? "text-amber-400" : "text-muted-foreground/50"}`}>
                  {prompt.length}/2000
                </span>
            </div>
          </div>

          {/* Controls below prompt */}
          <div className="space-y-3 mt-3">
            {/* Ratio / Resolution / Image Size dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedModel.settings
                .filter((s) => s.key === "aspect_ratio" || s.key === "image_size" || s.key === "resolution")
                .map((setting) => renderSetting(setting))}
            </div>

            {/* Number of images */}
            {(selectedModel.maxImages || 1) > 1 && (() => {
              const maxImg = selectedModel.maxImages || 1;
              const numImgDropdownId = "num-images-dropdown";
              return (
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Nombre d'images
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setOpenRatioDropdown(openRatioDropdown === numImgDropdownId ? null : numImgDropdownId)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md glass text-[11px] font-medium text-foreground hover:bg-muted/40 transition-all"
                    >
                      <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24 }}>
                        <span className="border-[1.5px] border-current rounded-[2px] flex items-center justify-center" style={{ width: 16, height: 16 }}>
                          <span className="text-[8px] font-bold leading-none">{numImages}</span>
                        </span>
                      </span>
                      <span>{numImages} image{numImages > 1 ? "s" : ""}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${openRatioDropdown === numImgDropdownId ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {openRatioDropdown === numImgDropdownId && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 bottom-full left-0 mb-1 min-w-[160px] rounded-lg glass border border-border/50 shadow-xl py-1 backdrop-blur-xl"
                        >
                          {Array.from({ length: maxImg }, (_, i) => i + 1).map((n) => {
                            const isSelected = n === numImages;
                            return (
                              <button
                                key={n}
                                onClick={() => {
                                  setNumImages(n);
                                  setOpenRatioDropdown(null);
                                }}
                                className={`flex items-center gap-2.5 w-full px-3 py-2 text-[11px] font-medium transition-all text-left ${
                                  isSelected
                                    ? "text-foreground bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center" style={{ width: 24, height: 24 }}>
                                  <span className={`border-[1.5px] rounded-[2px] flex items-center justify-center ${isSelected ? "border-primary" : "border-current"}`} style={{ width: 16, height: 16 }}>
                                    <span className="text-[8px] font-bold leading-none">{n}</span>
                                  </span>
                                </span>
                                <span>{n} image{n > 1 ? "s" : ""}</span>
                                {isSelected && <Check className="w-3 h-3 ml-auto text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}

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
