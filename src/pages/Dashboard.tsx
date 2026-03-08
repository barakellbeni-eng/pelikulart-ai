import { useState, useRef, useEffect, useSyncExternalStore, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useProjects } from "@/hooks/useProjects";
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
  Camera,
  RefreshCw,
  Info,
  FolderInput,
  Package,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FAL_MODELS, getModelById, getDefaultSettings, getModelsByType, getModelsByTypeGrouped, calculateCaurisCost, type FalModel } from "@/lib/fal-models";
import { getBrandLogo } from "@/lib/brandLogos";
import GenerationProgress from "@/components/GenerationProgress";
import ActiveJobsPanel from "@/components/ActiveJobsPanel";
import MediaPickerModal from "@/components/MediaPickerModal";
import { ViewModePopover, FiltersPopover } from "@/components/GalleryViewSettings";
import { useActiveJobs } from "@/hooks/useActiveJobs";
import { getGenerationJob, startGeneration, completeGeneration, failGeneration, subscribeGeneration } from "@/hooks/useGenerationStore";
import { getSignedUrl, getSignedUrls } from "@/lib/storage";

const GENERATE_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
const GENERATE_IMAGE_GOOGLE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image-google`;
const GENERATE_VIDEO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`;
const GENERATE_AUDIO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-audio`;
const START_GENERATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-generation`;

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
  id?: string;
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
  id?: string;
  url: string;
  prompt?: string;
  timestamp?: number;
}

interface GeneratedAudio {
  id?: string;
  url: string;
  prompt?: string;
  timestamp?: number;
  modelId?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, deduct, refetch: refetchCauris } = useCauris();
  const { refetch: refetchJobs } = useActiveJobs(user?.id ?? null);
  const { selectedProjectId, updateCover, projects, selectProject } = useProjects();
  const [activeTab, setActiveTab] = useState<"image" | "video" | "audio">("image");
  const [prompt, setPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const imageModels = getModelsByType("image");
  const videoModels = getModelsByType("video");
  const audioModels = getModelsByType("audio");
  const currentModels = activeTab === "video" ? videoModels : activeTab === "audio" ? audioModels : imageModels;

  const [selectedModel, setSelectedModel] = useState<FalModel>(imageModels[0]);
  const [modelSettings, setModelSettings] = useState<Record<string, any>>(getDefaultSettings(imageModels[0]));
  const [numImages, setNumImages] = useState(1);
  // Cache settings per model so switching doesn't lose adjustments
  const settingsCacheRef = useRef<Record<string, { settings: Record<string, any>; numImages: number }>>({});

  const generationJob = useSyncExternalStore(subscribeGeneration, getGenerationJob);
  const isGenerating = generationJob?.status === "pending";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GeneratedVideo[]>([]);
  const [galleryAudios, setGalleryAudios] = useState<GeneratedAudio[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referencePreviews, setReferencePreviews] = useState<string[]>([]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [openRatioDropdown, setOpenRatioDropdown] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [previewVideo, setPreviewVideo] = useState<GeneratedVideo | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDescribingImage, setIsDescribingImage] = useState(false);
  const [galleryLayout, setGalleryLayout] = useState<"row" | "grid">("grid");
  const [gallerySizeLevel, setGallerySizeLevel] = useState<number>(() => {
    const saved = localStorage.getItem("gallerySizeLevel");
    return saved ? parseInt(saved) : 3;
  });
  const [galleryImageSize, setGalleryImageSize] = useState<"mini" | "small" | "medium" | "large">("medium");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [playingDashAudioId, setPlayingDashAudioId] = useState<string | null>(null);
  const dashAudioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const describeInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverPrompt, setIsDraggingOverPrompt] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<Set<string>>(new Set());
  const [batchDeletingSelection, setBatchDeletingSelection] = useState(false);
  const [showMoveProjectModal, setShowMoveProjectModal] = useState(false);

  const getImageSelectionKey = useCallback((img: GeneratedImage) => `image:${img.id ?? img.url}`, []);
  const getVideoSelectionKey = useCallback((vid: GeneratedVideo) => `video:${vid.id ?? vid.url}`, []);

  const toggleSelection = useCallback((key: string) => {
    setSelectedGalleryItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedGalleryItems(new Set()), []);

  const selectionCount = selectedGalleryItems.size;

  useEffect(() => {
    const validKeys = new Set<string>([
      ...galleryImages.map(getImageSelectionKey),
      ...galleryVideos.map(getVideoSelectionKey),
    ]);

    setSelectedGalleryItems((prev) => {
      const next = new Set(Array.from(prev).filter((key) => validKeys.has(key)));
      return next.size === prev.size ? prev : next;
    });
  }, [galleryImages, galleryVideos, getImageSelectionKey, getVideoSelectionKey]);

  // Helper: fetch a URL as base64 data URL
  const urlToBase64 = useCallback(async (url: string): Promise<string> => {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // Handle drop on prompt textarea → describe image → insert text
  const handleDropOnPrompt = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverPrompt(false);
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image");
    if (!imageUrl) return;
    setIsDescribingImage(true);
    try {
      const base64 = await urlToBase64(imageUrl);
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
    } catch (err: any) {
      console.error("Drop describe error:", err);
      toast.error(err.message || "Erreur lors de la description");
    } finally {
      setIsDescribingImage(false);
    }
  }, [urlToBase64]);

  // Handle drop on upload zone → add as reference image
  const handleDropOnUpload = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    const imageUrl = e.dataTransfer.getData("text/x-gallery-image");
    if (!imageUrl) return;
    const maxInput = selectedModel.maxInputImages || 1;
    if (referenceImages.length >= maxInput) {
      toast.error(`Maximum ${maxInput} images pour ce modèle`);
      return;
    }
    try {
      const base64 = await urlToBase64(imageUrl);
      setReferenceImages((prev) => [...prev, base64]);
      setReferencePreviews((prev) => [...prev, base64]);
      toast.success("Image ajoutée comme référence !");
    } catch {
      // If base64 fails, use the URL directly
      setReferenceImages((prev) => [...prev, imageUrl]);
      setReferencePreviews((prev) => [...prev, imageUrl]);
      toast.success("Image ajoutée comme référence !");
    }
  }, [selectedModel, referenceImages, urlToBase64]);

  const handleSelectModel = (model: FalModel) => {
    // Save current model's settings before switching
    settingsCacheRef.current[selectedModel.id] = { settings: { ...modelSettings }, numImages };
    // Restore cached settings or use defaults
    const cached = settingsCacheRef.current[model.id];
    setSelectedModel(model);
    setModelSettings(cached?.settings ?? getDefaultSettings(model));
    setNumImages(cached?.numImages ?? 1);
    setShowModelDropdown(false);
  };

  const handleSwitchTab = (tab: "image" | "video" | "audio") => {
    // Save current model's settings
    settingsCacheRef.current[selectedModel.id] = { settings: { ...modelSettings }, numImages };
    setActiveTab(tab);
    const targetModels = tab === "video" ? videoModels : tab === "audio" ? audioModels : imageModels;
    // Try to restore previously used model in this tab, otherwise first model
    const cachedModelId = Object.keys(settingsCacheRef.current).find(id =>
      targetModels.some(m => m.id === id)
    );
    const targetModel = cachedModelId ? targetModels.find(m => m.id === cachedModelId)! : targetModels[0];
    const cached = settingsCacheRef.current[targetModel.id];
    setSelectedModel(targetModel);
    setModelSettings(cached?.settings ?? getDefaultSettings(targetModel));
    setNumImages(cached?.numImages ?? 1);
  };

  const updateSetting = (key: string, value: any) => {
    setModelSettings((prev) => ({ ...prev, [key]: value }));
  };




  // Load history from DB
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      let query = supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (selectedProjectId) {
        query = query.eq("project_id", selectedProjectId);
      }

      const { data, error } = await query;
      if (!error && data) {
        // Resolve signed URLs for all items
        const allUrls = (data as any[]).map((g: any) => g.image_url as string);
        const signedUrlList = await getSignedUrls(allUrls);

        const images: GeneratedImage[] = [];
        const videos: GeneratedVideo[] = [];
        const audios: GeneratedAudio[] = [];
        for (let idx = 0; idx < (data as any[]).length; idx++) {
          const g = (data as any[])[idx];
          const item = {
            id: g.id,
            url: signedUrlList[idx],
            prompt: g.prompt,
            timestamp: new Date(g.created_at).getTime(),
          };
          if (g.media_type === "video") {
            videos.push(item);
          } else if (g.media_type === "audio") {
            audios.push(item);
          } else {
            images.push({ ...item, resolution: g.resolution });
          }
        }
        setGalleryImages(images);
        setGalleryVideos(videos);
        setGalleryAudios(audios);
      }
    };
    loadHistory();
  }, [user, selectedProjectId]);

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

  // Gate: check auth then credits before any generation
  const gateGeneration = (cost: number): boolean => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    if (balance < cost) {
      setShowCreditsModal(true);
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    // Edit models require at least one reference image
    if (selectedModel.id.endsWith("-edit") && referenceImages.length === 0) {
      toast.error("Ce modèle d'édition nécessite au moins une image de référence.");
      return;
    }
    const cost = calculateCaurisCost(selectedModel, modelSettings, numImages);
    if (!gateGeneration(cost)) return;

    // Capture current values before resetting UI
    const currentPrompt = prompt;
    const currentModel = selectedModel;
    const currentSettings = { ...modelSettings };
    const currentNumImages = numImages;
    const currentRefImages = [...referenceImages];

    // Brief submitting flash for feedback
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 600);

    // Fire and forget — generation runs in background
    (async () => {
      startGeneration("image", currentPrompt, currentNumImages);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const cleanSettings: Record<string, any> = {};
        for (const [key, value] of Object.entries(currentSettings)) {
          if (value === "" || value === undefined || value === null) continue;
          if (key === "seed" && value === 0) continue;
          cleanSettings[key] = value;
        }

        const imgCostForPayload = calculateCaurisCost(currentModel, currentSettings, currentNumImages);
        const payload: Record<string, any> = {
          prompt: currentPrompt,
          model_id: currentModel.id,
          num_images: Math.min(currentNumImages, currentModel.maxImages || 1),
          output_format: "png",
          cauris_cost: imgCostForPayload,
          project_id: selectedProjectId || undefined,
          ...cleanSettings,
        };
        if (currentRefImages.length > 0 && currentModel.supportsImageInput) {
          if ((currentModel.maxInputImages || 1) > 1) {
            payload.image_urls = currentRefImages;
          } else {
            payload.image_url = currentRefImages[0];
          }
        }

        // Route KIE models to start-generation (async job system with polling)
        const isKieModel = currentModel.provider === "kie" || currentModel.endpoint === "kie";
        if (isKieModel) {
          payload.tool_type = "image";
          const kieResp = await fetch(START_GENERATION_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(payload),
          });
          if (!kieResp.ok) {
            const err = await kieResp.json().catch(() => ({ error: "Erreur inconnue" }));
            throw new Error(err.error || `Erreur ${kieResp.status}`);
          }
          const kieData = await kieResp.json();
          if (kieData.new_balance !== undefined) refetchCauris();

          // Poll generation_jobs until completed/failed
          const jobId = kieData.job_id;
          if (jobId) {
            const maxPolls = 200;
            for (let i = 0; i < maxPolls; i++) {
              await new Promise((r) => setTimeout(r, 3000));
              const { data: jobRow } = await supabase
                .from("generation_jobs")
                .select("status, result_url, result_url_temp, result_metadata")
                .eq("id", jobId)
                .single();

              if (jobRow?.status === "completed") {
                // Fetch new generations from DB and add to gallery
                const { data: newGens } = await supabase
                  .from("generations")
                  .select("*")
                  .order("created_at", { ascending: false })
                  .limit(Math.min(currentNumImages, 4));

                if (newGens?.length) {
                  const newImages: GeneratedImage[] = newGens.map((g: any) => ({
                    url: g.image_url,
                    prompt: g.prompt,
                    timestamp: new Date(g.created_at).getTime(),
                    modelId: currentModel.id,
                    modelSettings: currentSettings,
                    caurisCost: imgCostForPayload,
                    numImages: currentNumImages,
                  }));
                  setGalleryImages((prev) => [...newImages, ...prev]);
                  if (selectedProjectId && newImages.length > 0) {
                    updateCover(selectedProjectId, newImages[0].url);
                  }
                }
                completeGeneration();
                return;
              }
              if (jobRow?.status === "failed") {
                const errMsg = (jobRow.result_metadata as any)?.error || "La génération a échoué";
                throw new Error(errMsg);
              }
            }
            throw new Error("La génération a pris trop de temps (timeout)");
          }
          completeGeneration();
          return;
        }

        const imageEndpoint = currentModel.endpoint === "google-direct" ? GENERATE_IMAGE_GOOGLE_URL : GENERATE_IMAGE_URL;
        const resp = await fetch(imageEndpoint, {
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
        const imgCost = calculateCaurisCost(currentModel, currentSettings, currentNumImages);

        if (data.images?.length) {
          data.images.forEach((img: any) => {
            newImages.push({
              url: img.url,
              width: img.width,
              height: img.height,
              prompt: currentPrompt,
              resolution: currentSettings.resolution || currentSettings.image_size || "",
              timestamp: Date.now(),
              modelId: currentModel.id,
              modelSettings: currentSettings,
              caurisCost: imgCost,
              numImages: currentNumImages,
            });
          });
        } else if (data.image_url) {
          newImages.push({ url: data.image_url, prompt: currentPrompt, timestamp: Date.now(), modelId: currentModel.id, modelSettings: currentSettings, caurisCost: imgCost, numImages: currentNumImages });
        } else {
          throw new Error("Aucune image retournée");
        }

        setGalleryImages((prev) => [...newImages, ...prev]);
        if (selectedProjectId && newImages.length > 0) {
          updateCover(selectedProjectId, newImages[0].url);
        }
        if (data.new_balance !== undefined) {
          refetchCauris();
        }
        completeGeneration();
      } catch (e: any) {
        console.error("Generation error:", e);
        toast.error(e.message || "Erreur lors de la génération");
        failGeneration(e.message);
      } finally {
        if (getGenerationJob()?.status === "pending") completeGeneration();
      }
    })();
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings);
    if (!gateGeneration(cost)) return;

    const currentPrompt = prompt;
    const currentModel = selectedModel;
    const currentSettings = { ...modelSettings };
    const currentRefImages = [...referenceImages];

    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 600);

    (async () => {
      startGeneration("video", currentPrompt);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const cleanSettings: Record<string, any> = {};
        for (const [key, value] of Object.entries(currentSettings)) {
          if (value === "" || value === undefined || value === null) continue;
          if (key === "seed" && value === 0) continue;
          cleanSettings[key] = value;
        }

        const payload: Record<string, any> = {
          prompt: currentPrompt,
          model_id: currentModel.id,
          cauris_cost: cost,
          project_id: selectedProjectId || undefined,
          ...cleanSettings,
        };
        if (currentRefImages.length > 0 && currentModel.supportsImageInput) {
          payload.image_url = currentRefImages[0];
        }

        const authHeader = `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

        // Route KIE models to start-generation with polling
        const isKieModel = currentModel.provider === "kie" || currentModel.endpoint === "kie";
        if (isKieModel) {
          payload.tool_type = "video";
          const kieResp = await fetch(START_GENERATION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify(payload),
          });
          if (!kieResp.ok) {
            const err = await kieResp.json().catch(() => ({ error: "Erreur inconnue" }));
            throw new Error(err.error || `Erreur ${kieResp.status}`);
          }
          const kieData = await kieResp.json();
          if (kieData.new_balance !== undefined) refetchCauris();

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

              if (jobRow?.status === "completed" && jobRow.result_url) {
                setGalleryVideos((prev) => [{ url: jobRow.result_url!, prompt: currentPrompt, timestamp: Date.now() }, ...prev]);
                toast.success("Vidéo générée !");
                refetchCauris();
                completeGeneration();
                return;
              }
              if (jobRow?.status === "failed") {
                const errMsg = (jobRow.result_metadata as any)?.error || "La génération vidéo a échoué";
                throw new Error(errMsg);
              }
            }
            throw new Error("La génération vidéo a pris trop de temps (timeout)");
          }
          completeGeneration();
          return;
        }

        const resp = await fetch(GENERATE_VIDEO_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erreur inconnue" }));
          throw new Error(err.error || `Erreur ${resp.status}`);
        }

        const data = await resp.json();

        if (data.video_url) {
          setGalleryVideos((prev) => [{ url: data.video_url, prompt: currentPrompt, timestamp: Date.now() }, ...prev]);
          toast.success("Vidéo générée !");
          refetchCauris();
          completeGeneration();
          return;
        }

        if (data.status === "QUEUED" && data.status_url && data.response_url) {
          toast.info("Vidéo en file d'attente, veuillez patienter...");
          const maxPolls = 200;
          for (let i = 0; i < maxPolls; i++) {
            await new Promise((r) => setTimeout(r, 3000));
            try {
              const pollResp = await fetch(GENERATE_VIDEO_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: authHeader },
                body: JSON.stringify({ action: "poll", status_url: data.status_url, response_url: data.response_url }),
              });
              const pollData = await pollResp.json();

              if (pollData.status === "COMPLETED" && pollData.video_url) {
                setGalleryVideos((prev) => [{ url: pollData.video_url, prompt: currentPrompt, timestamp: Date.now() }, ...prev]);
                toast.success("Vidéo générée !");
                refetchCauris();
                completeGeneration();
                return;
              }
              if (pollData.status === "FAILED") {
                throw new Error(pollData.error || "La génération vidéo a échoué");
              }
            } catch (pollErr: any) {
              if (pollErr.message?.includes("échoué") || pollErr.message?.includes("FAILED")) throw pollErr;
              console.warn("Poll error, retrying...", pollErr.message);
            }
          }
          throw new Error("La génération vidéo a pris trop de temps (timeout)");
        }

        throw new Error("Aucune vidéo retournée");
      } catch (e: any) {
        console.error("Video generation error:", e);
        toast.error(e.message || "Erreur lors de la génération vidéo");
        failGeneration(e.message);
      } finally {
        if (getGenerationJob()?.status === "pending") completeGeneration();
      }
    })();
  };

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) return;
    const cost = calculateCaurisCost(selectedModel, modelSettings);
    if (!gateGeneration(cost)) return;

    const currentPrompt = prompt;
    const currentModel = selectedModel;
    const currentSettings = { ...modelSettings };
    const currentRefImages = [...referenceImages];

    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 600);

    (async () => {
      startGeneration("audio", currentPrompt);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        const cleanSettings: Record<string, any> = {};
        for (const [key, value] of Object.entries(currentSettings)) {
          if (value === "" || value === undefined || value === null) continue;
          cleanSettings[key] = value;
        }

        const payload: Record<string, any> = {
          prompt: currentPrompt,
          model_id: currentModel.id,
          cauris_cost: cost,
          project_id: selectedProjectId || undefined,
          ...cleanSettings,
        };
        if (currentRefImages.length > 0 && currentModel.supportsImageInput) {
          payload.image_url = currentRefImages[0];
        }

        // Route KIE models to start-generation with polling
        const isKieModel = currentModel.provider === "kie" || currentModel.endpoint === "kie";
        if (isKieModel) {
          payload.tool_type = "audio";
          const kieResp = await fetch(START_GENERATION_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(payload),
          });
          if (!kieResp.ok) {
            const err = await kieResp.json().catch(() => ({ error: "Erreur inconnue" }));
            throw new Error(err.error || `Erreur ${kieResp.status}`);
          }
          const kieData = await kieResp.json();
          if (kieData.new_balance !== undefined) refetchCauris();

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

              if (jobRow?.status === "completed" && jobRow.result_url) {
                setGalleryAudios((prev) => [
                  { url: jobRow.result_url!, prompt: currentPrompt, timestamp: Date.now(), modelId: currentModel.id },
                  ...prev,
                ]);
                toast.success("Audio généré !");
                refetchCauris();
                completeGeneration();
                return;
              }
              if (jobRow?.status === "failed") {
                const errMsg = (jobRow.result_metadata as any)?.error || "La génération audio a échoué";
                throw new Error(errMsg);
              }
            }
            throw new Error("La génération audio a pris trop de temps (timeout)");
          }
          completeGeneration();
          return;
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
            { url: data.audio_url, prompt: currentPrompt, timestamp: Date.now(), modelId: currentModel.id },
            ...prev,
          ]);
          toast.success("Audio généré !");
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
    })();
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

  const DELETE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

  const handleDeleteImage = async (img: GeneratedImage, options?: { silent?: boolean }) => {
    if (!user) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token && img.id) {
        await fetch(DELETE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ job_id: img.id }),
        });
      } else if (token) {
        // Fallback: delete from legacy generations table directly
        await supabase.from("generations").delete().eq("user_id", user.id).eq("image_url", img.url);
      }
      setGalleryImages((prev) => prev.filter((g) => g.url !== img.url));
      setSelectedGalleryItems((prev) => {
        const next = new Set(prev);
        next.delete(getImageSelectionKey(img));
        return next;
      });
      setPreviewImage(null);
      if (!options?.silent) toast.success("Image supprimée définitivement");
    } catch (error) {
      if (!options?.silent) toast.error("Erreur lors de la suppression");
      throw error;
    }
  };

  const handleDeleteVideo = async (vid: GeneratedVideo, options?: { silent?: boolean }) => {
    if (!user) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token && vid.id) {
        await fetch(DELETE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ job_id: vid.id }),
        });
      } else if (token) {
        await supabase.from("generations").delete().eq("user_id", user.id).eq("image_url", vid.url);
      }
      setGalleryVideos((prev) => prev.filter((g) => g.url !== vid.url));
      setSelectedGalleryItems((prev) => {
        const next = new Set(prev);
        next.delete(getVideoSelectionKey(vid));
        return next;
      });
      setPreviewVideo(null);
      if (!options?.silent) toast.success("Vidéo supprimée définitivement");
    } catch (error) {
      if (!options?.silent) toast.error("Erreur lors de la suppression");
      throw error;
    }
  };

  const handleDeleteAudio = async (aud: GeneratedAudio) => {
    if (!user) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token && aud.id) {
        await fetch(DELETE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ job_id: aud.id }),
        });
      }
      setGalleryAudios((prev) => prev.filter((a) => a.url !== aud.url));
      toast.success("Audio supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const toggleDashAudioPlay = (id: string, url: string) => {
    if (playingDashAudioId === id) {
      dashAudioRefs.current[id]?.pause();
      setPlayingDashAudioId(null);
      return;
    }
    if (playingDashAudioId && dashAudioRefs.current[playingDashAudioId]) {
      dashAudioRefs.current[playingDashAudioId].pause();
    }
    if (!dashAudioRefs.current[id]) {
      dashAudioRefs.current[id] = new Audio(url);
      dashAudioRefs.current[id].onended = () => setPlayingDashAudioId(null);
    }
    dashAudioRefs.current[id].play();
    setPlayingDashAudioId(id);
  };

  const handleSizeSliderChange = (val: number) => {
    setGallerySizeLevel(val);
    localStorage.setItem("gallerySizeLevel", String(val));
  };

  const handleBatchDeleteSelection = async () => {
    if (!user || batchDeletingSelection || selectionCount === 0) return;

    const imagesToDelete = galleryImages.filter((img) => selectedGalleryItems.has(getImageSelectionKey(img)));
    const videosToDelete = galleryVideos.filter((vid) => selectedGalleryItems.has(getVideoSelectionKey(vid)));

    if (imagesToDelete.length + videosToDelete.length === 0) {
      clearSelection();
      return;
    }

    setBatchDeletingSelection(true);

    try {
      const results = await Promise.allSettled([
        ...imagesToDelete.map((img) => handleDeleteImage(img, { silent: true })),
        ...videosToDelete.map((vid) => handleDeleteVideo(vid, { silent: true })),
      ]);

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        toast.success(`${successCount} génération(s) supprimée(s)`);
      } else {
        toast.warning(`${successCount}/${totalCount} génération(s) supprimée(s)`);
      }
    } finally {
      setBatchDeletingSelection(false);
    }
  };

  // Batch download as ZIP
  const handleBatchDownload = async () => {
    const files: { url: string; name: string; prompt: string }[] = [];
    for (const key of selectedGalleryItems) {
      const img = galleryImages.find((g) => getImageSelectionKey(g) === key);
      if (img) {
        const ext = img.url.includes(".jpg") || img.url.includes(".jpeg") ? "jpg" : "png";
        const shortPrompt = (img.prompt || "image").replace(/[^a-zA-Z0-9À-ÿ ]/g, "").trim().slice(0, 40).trim();
        files.push({ url: img.url, name: `Pelikulart image - ${shortPrompt}.${ext}`, prompt: img.prompt || "" });
        continue;
      }
      const vid = galleryVideos.find((g) => getVideoSelectionKey(g) === key);
      if (vid) {
        const shortPrompt = (vid.prompt || "video").replace(/[^a-zA-Z0-9À-ÿ ]/g, "").trim().slice(0, 40).trim();
        files.push({ url: vid.url, name: `Pelikulart video - ${shortPrompt}.mp4`, prompt: vid.prompt || "" });
      }
    }
    if (files.length === 0) return;

    toast.info(`Téléchargement de ${files.length} fichiers…`);

    try {
      // Fetch all files in parallel
      const blobs = await Promise.all(
        files.map(async (f) => {
          const resp = await fetch(f.url);
          if (!resp.ok) throw new Error("fetch failed");
          return resp.blob();
        })
      );

      // Use dynamic import for JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder("Pelikulart creator")!;

      // Deduplicate names
      const usedNames = new Set<string>();
      for (let i = 0; i < files.length; i++) {
        let name = files[i].name;
        if (usedNames.has(name)) {
          const dotIdx = name.lastIndexOf(".");
          const base = name.slice(0, dotIdx);
          const ext = name.slice(dotIdx);
          let counter = 2;
          while (usedNames.has(`${base} (${counter})${ext}`)) counter++;
          name = `${base} (${counter})${ext}`;
        }
        usedNames.add(name);
        folder.file(name, blobs[i]);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "Pelikulart creator.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("ZIP téléchargé !");
    } catch (err) {
      console.error("ZIP download error:", err);
      toast.error("Erreur lors du téléchargement");
    }
  };

  // Send exactly 2 images to video as start + end frames
  const handleSendToVideoStartEnd = () => {
    const selectedImages = galleryImages.filter((img) => selectedGalleryItems.has(getImageSelectionKey(img)));
    if (selectedImages.length !== 2) return;
    const i2vModels = getModelsByType("video").filter((m) => m.supportsImageInput && (m.maxInputImages || 1) >= 2);
    const targetModel = i2vModels.length > 0 ? i2vModels[0] : getModelsByType("video").filter((m) => m.supportsImageInput)[0];
    if (!targetModel) { toast.error("Aucun modèle vidéo disponible"); return; }
    setActiveTab("video");
    setSelectedModel(targetModel);
    setModelSettings(getDefaultSettings(targetModel));
    setReferenceImages([selectedImages[0].url, selectedImages[1].url]);
    setReferencePreviews([selectedImages[0].url, selectedImages[1].url]);
    const combinedPrompt = [selectedImages[0].prompt, selectedImages[1].prompt].filter(Boolean).join(" → ");
    if (combinedPrompt) setPrompt(combinedPrompt);
    clearSelection();
    toast.success("2 images chargées (Start & End) dans le générateur vidéo !");
  };

  // Move selected items to a project
  const handleMoveToProject = async (projectId: string) => {
    const ids: string[] = [];
    for (const key of selectedGalleryItems) {
      const img = galleryImages.find((g) => getImageSelectionKey(g) === key);
      if (img?.id) { ids.push(img.id); continue; }
      const vid = galleryVideos.find((g) => getVideoSelectionKey(g) === key);
      if (vid?.id) ids.push(vid.id);
    }
    if (ids.length === 0) return;
    const results = await Promise.allSettled(
      ids.map((id) =>
        supabase.from("generations").update({ project_id: projectId }).eq("id", id)
      )
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    toast.success(`${ok} élément(s) déplacé(s)`);
    clearSelection();
    setShowMoveProjectModal(false);
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

  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 overflow-hidden relative" style={{ height: '100%' }}>
      {/* Mobile settings toggle */}
      <button
        onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-accent"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* ===== LEFT SIDEBAR (desktop always visible, mobile as overlay) ===== */}
      <div className={`
        fixed inset-0 z-30 md:relative md:z-auto
        ${mobileSettingsOpen ? "block" : "hidden md:block"}
      `}>
        {/* Mobile backdrop */}
        <div
          className="absolute inset-0 bg-black/60 md:hidden"
          onClick={() => setMobileSettingsOpen(false)}
        />
        <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm md:relative md:w-72 md:min-w-[288px] md:max-w-[288px] shrink-0 bg-card/95 md:bg-card/50 backdrop-blur-xl md:backdrop-blur-none flex flex-col h-full overflow-hidden">
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
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
                {getBrandLogo(selectedModel.brand, selectedModel.id) ? (
                  <img src={getBrandLogo(selectedModel.brand, selectedModel.id)!} alt={selectedModel.brand} className="w-8 h-8 rounded-md object-contain shrink-0 pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                ) : (
                  <span className="w-8 h-8 rounded-md bg-white/[0.06] flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 uppercase">
                    {selectedModel.brand.slice(0, 2)}
                  </span>
                )}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {selectedModel.name}
                    </span>
                    {selectedModel.recommended && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        ★
                      </span>
                    )}
                  </div>
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
                    className="fixed left-4 right-4 md:left-[288px] md:right-auto top-[120px] md:w-72 bg-card border border-white/[0.08] rounded-xl p-1 z-[100] max-h-[70vh] overflow-y-auto shadow-2xl"
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
                            {getBrandLogo(model.brand, model.id) ? (
                              <img src={getBrandLogo(model.brand, model.id)!} alt={model.brand} className="w-7 h-7 rounded-md object-contain shrink-0 pointer-events-none select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
                            ) : (
                              <span className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 uppercase">
                                {model.brand.slice(0, 2)}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                                {model.name}
                              </span>
                              {model.recommended && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                  Populaire
                                </span>
                              )}
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
              <div
                className={`grid grid-cols-3 gap-2 rounded-xl transition-all ${isDraggingOverUpload ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                onDragOver={(e) => { if (e.dataTransfer.types.includes("text/x-gallery-image")) { e.preventDefault(); setIsDraggingOverUpload(true); } }}
                onDragLeave={() => setIsDraggingOverUpload(false)}
                onDrop={handleDropOnUpload}
              >
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
                  <div className="flex flex-col gap-2">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setShowMediaPicker(true)}
                      className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground font-medium">Ajouter</span>
                    </motion.button>
                  </div>
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
            <div
              className={`relative rounded-xl transition-all ${isDraggingOverPrompt ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
              onDragOver={(e) => { if (e.dataTransfer.types.includes("text/x-gallery-image")) { e.preventDefault(); setIsDraggingOverPrompt(true); } }}
              onDragLeave={() => setIsDraggingOverPrompt(false)}
              onDrop={handleDropOnPrompt}
            >
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
              {isDraggingOverPrompt && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-primary/10 border-2 border-dashed border-primary/40 pointer-events-none">
                  <span className="text-xs font-semibold text-primary">Déposer pour décrire l'image →  prompt</span>
                </div>
              )}
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

          {/* Controls below prompt: Ratio / Resolution / Image Size */}
          <div className="space-y-3 mt-3">
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
          </div>
        </div>
        </div>

        {/* ===== PINNED BOTTOM BAR ===== */}
        <div className="shrink-0 p-4 space-y-3 bg-card/80 backdrop-blur-sm">
          {/* Generate Button */}
          <button
            onClick={() => {
              setMobileSettingsOpen(false);
              if (activeTab === "video") handleGenerateVideo();
              else if (activeTab === "audio") handleGenerateAudio();
              else handleGenerate();
            }}
            disabled={isSubmitting || !prompt.trim()}
            className="btn-generate w-full flex items-center justify-between text-sm disabled:opacity-50 disabled:animate-none"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 mx-auto">
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi...
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
              {user ? (
                <>
                  Il vous reste <span className="font-bold text-foreground">{balance}</span> cauris
                  {balance < calculateCaurisCost(selectedModel, modelSettings, numImages) && (
                    <> · <a href="/pricing" className="text-primary underline underline-offset-2 font-semibold">Recharger</a></>
                  )}
                </>
              ) : (
                <a href="/auth" className="text-primary underline underline-offset-2 font-semibold">Connecte-toi pour générer</a>
              )}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* ===== RIGHT GALLERY (UNIFIED) ===== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2 sm:py-3">
          <div className="flex items-center gap-1 glass rounded-lg p-0.5 overflow-x-auto max-w-full scrollbar-hide">
            {([
              { value: "all" as const, label: "Tout", icon: null, count: galleryImages.length + galleryVideos.length + galleryAudios.length },
              { value: "image" as const, label: "Images", icon: Image, count: galleryImages.length },
              { value: "video" as const, label: "Vidéos", icon: Video, count: galleryVideos.length },
              { value: "audio" as const, label: "Audios", icon: Music, count: galleryAudios.length },
            ]).map((f) => (
              <button
                key={f.value}
                onClick={() => setGalleryFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  galleryFilter === f.value
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.icon && <f.icon className="w-3 h-3" />}
                {f.label}
                {f.count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${galleryFilter === f.value ? "bg-primary/30" : "bg-muted/50"}`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Size slider */}
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 h-8">
              <ZoomOut className="w-3 h-3 text-muted-foreground" />
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={gallerySizeLevel}
                onChange={(e) => handleSizeSliderChange(Number(e.target.value))}
                className="w-16 h-[3px] accent-primary cursor-pointer"
              />
              <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <FiltersPopover
              typeFilter={galleryFilter}
              onTypeFilterChange={setGalleryFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2 sm:p-4 pb-24 md:pb-4 min-h-0 scrollbar-thin"
          onClick={(e) => {
            // Click on empty space → clear selection
            if (selectionCount > 0 && !(e.target as HTMLElement).closest("[data-gallery-card], button, a")) {
              clearSelection();
            }
          }}
        >
          {/* Active Jobs Panel moved to GlobalActiveJobs */}
          {(() => {
            // Build unified gallery items
            type UnifiedItem = { type: "image"; data: GeneratedImage; ts: number } | { type: "video"; data: GeneratedVideo; ts: number } | { type: "audio"; data: GeneratedAudio; ts: number };
            const allItems: UnifiedItem[] = [];
            if (galleryFilter === "all" || galleryFilter === "image") {
              galleryImages.forEach((img) => allItems.push({ type: "image", data: img, ts: img.timestamp || 0 }));
            }
            if (galleryFilter === "all" || galleryFilter === "video") {
              galleryVideos.forEach((vid) => allItems.push({ type: "video", data: vid, ts: vid.timestamp || 0 }));
            }
            if (galleryFilter === "all" || galleryFilter === "audio") {
              galleryAudios.forEach((aud) => allItems.push({ type: "audio", data: aud, ts: aud.timestamp || 0 }));
            }
            allItems.sort((a, b) => b.ts - a.ts);

            // Date range filter
            const dateFilteredItems = allItems.filter((item) => {
              if (dateFrom) {
                const from = new Date(dateFrom).getTime();
                if (item.ts < from) return false;
              }
              if (dateTo) {
                const to = new Date(dateTo).getTime() + 86400000; // end of day
                if (item.ts > to) return false;
              }
              return true;
            });

            const totalCount = dateFilteredItems.length;

            if (totalCount === 0 && !isGenerating) {
              return (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vos créations apparaîtront ici</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Générez des images, vidéos ou audios pour les voir ici</p>
                  </div>
                </div>
              );
            }

            if (galleryLayout === "row") {
              // ===== FEED VIEW (like Kling AI) =====
              return (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Loading placeholder */}
                  {isGenerating && (
                    <motion.div
                      key="loading-feed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-muted/10 overflow-hidden"
                    >
                      <div className="aspect-video flex items-center justify-center bg-muted/20 py-8">
                        <GenerationProgress estimatedTime={selectedModel.estimatedTime} />
                      </div>
                    </motion.div>
                  )}

                  {dateFilteredItems.map((item, i) => {
                    const model = (() => {
                      if (item.type === "image") {
                        const img = item.data as GeneratedImage;
                        return img.modelId ? getModelById(img.modelId) : null;
                      }
                      return null;
                    })();

                    const selectionKey =
                      item.type === "image"
                        ? getImageSelectionKey(item.data as GeneratedImage)
                        : item.type === "video"
                          ? getVideoSelectionKey(item.data as GeneratedVideo)
                          : null;
                    const isSelected = selectionKey ? selectedGalleryItems.has(selectionKey) : false;

                    return (
                      <motion.div
                        key={`feed-${item.type}-${i}-${item.ts}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`relative rounded-xl bg-card/20 overflow-hidden group`}
                      >
                        {selectionKey && (
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(selectionKey);
                            }}
                            className={`absolute top-2 left-2 z-20 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground scale-100 opacity-100"
                                : "bg-background/60 text-muted-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            }`}
                            title="Sélectionner"
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        )}

                        {/* Media */}
                        {item.type === "image" && (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              if (selectionCount > 0 && selectionKey) {
                                toggleSelection(selectionKey);
                                return;
                              }
                              setPreviewImage(item.data as GeneratedImage);
                            }}
                          >
                            <img
                              src={(item.data as GeneratedImage).url}
                              alt={(item.data as GeneratedImage).prompt || "Generated"}
                              className="w-full object-contain max-h-[280px] bg-black/20"
                              loading="lazy"
                            />
                          </div>
                        )}
                        {item.type === "video" && (
                          <div
                            className="cursor-pointer"
                            onClick={() => {
                              if (selectionCount > 0 && selectionKey) {
                                toggleSelection(selectionKey);
                                return;
                              }
                              setPreviewVideo(item.data as GeneratedVideo);
                            }}
                          >
                            <video
                              src={(item.data as GeneratedVideo).url}
                              controls
                              className="w-full max-h-[280px]"
                            />
                          </div>
                        )}
                        {item.type === "audio" && (
                          <div className="p-4">
                            <audio src={(item.data as GeneratedAudio).url} controls className="w-full" />
                          </div>
                        )}

                        {/* Actions bar */}
                        <div className="px-4 py-2.5 flex items-center gap-3">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                            item.type === "image" ? "bg-blue-500/20 text-blue-400" :
                            item.type === "video" ? "bg-purple-500/20 text-purple-400" :
                            "bg-green-500/20 text-green-400"
                          }`}>
                            {item.type === "image" && <Image className="w-2.5 h-2.5" />}
                            {item.type === "video" && <Video className="w-2.5 h-2.5" />}
                            {item.type === "audio" && <Music className="w-2.5 h-2.5" />}
                            {item.type === "image" ? "IMG" : item.type === "video" ? "VID" : "AUD"}
                          </span>

                          {model && (
                            <span className="text-[10px] text-muted-foreground">
                              {model.brand} {model.name}
                            </span>
                          )}

                          <div className="ml-auto flex items-center gap-1.5">
                            {item.type === "image" && (
                              <>
                                <button
                                  onClick={() => handleImageToVideo(item.data as GeneratedImage)}
                                  className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                                  title="Animer en vidéo"
                                >
                                  <Film className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => handleRecreateImage(item.data as GeneratedImage)}
                                  className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                                  title="Recréer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(item.data as GeneratedImage)}
                                  className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </button>
                              </>
                            )}
                            {item.type === "video" && (
                              <button
                                onClick={() => handleDeleteVideo(item.data as GeneratedVideo)}
                                className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(
                                item.type === "image" ? (item.data as GeneratedImage).url :
                                item.type === "video" ? (item.data as GeneratedVideo).url :
                                (item.data as GeneratedAudio).url,
                                i
                              )}
                              className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>

                        {/* Prompt / metadata */}
                        {(item.data as any).prompt && (
                          <div className="px-4 pb-3">
                            <p className="text-xs text-muted-foreground line-clamp-2">{(item.data as any).prompt}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            }

            const gridStyle = (() => {
              const sizes = [80, 130, 180, 240, 0];
              const size = sizes[gallerySizeLevel - 1];
              if (gallerySizeLevel === 5) return { gridTemplateColumns: "1fr" };
              if (gallerySizeLevel === 4) return { gridTemplateColumns: "repeat(2, 1fr)" };
              return { gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))` };
            })();
            const cardAspect = gallerySizeLevel >= 4 ? "aspect-video" : "aspect-square";

            return (
              <div className="grid gap-3" style={gridStyle}>
                {/* Loading placeholders */}
                {isGenerating && (
                  activeTab === "audio" ? (
                    <motion.div
                      key="loading-audio"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full rounded-xl bg-muted/10 flex flex-col items-center justify-center p-6 space-y-3"
                    >
                      <GenerationProgress estimatedTime={selectedModel.estimatedTime} />
                    </motion.div>
                  ) : activeTab === "video" ? (
                    <motion.div
                      key="loading-video"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-video rounded-xl bg-muted/10 flex flex-col items-center justify-center p-4 space-y-3"
                    >
                      <GenerationProgress estimatedTime={selectedModel.estimatedTime} />
                    </motion.div>
                  ) : (
                    Array.from({ length: numImages }).map((_, i) => (
                      <motion.div
                        key={`loading-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-xl bg-muted/10 flex flex-col items-center justify-center p-4 space-y-3"
                      >
                        <GenerationProgress estimatedTime={selectedModel.estimatedTime} compact />
                      </motion.div>
                    ))
                  )
                )}

                {dateFilteredItems.map((item, i) => {
                  if (item.type === "image") {
                    const img = item.data as GeneratedImage;
                    const imageSelectionKey = getImageSelectionKey(img);
                    const imageSelected = selectedGalleryItems.has(imageSelectionKey);

                    return (
                      <div
                        key={`img-${i}-${item.ts}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/x-gallery-image", img.url);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className={`aspect-square relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing`}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => {
                            if (selectionCount > 0) {
                              toggleSelection(imageSelectionKey);
                              return;
                            }
                            setPreviewImage(img);
                          }}
                          className="w-full h-full"
                        >
                          <img src={img.url} alt={img.prompt || "Generated"} className="w-full h-full object-cover rounded-xl pointer-events-none" loading="lazy" />

                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(imageSelectionKey);
                            }}
                            className={`absolute top-1.5 right-1.5 z-20 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                              imageSelected
                                ? "bg-primary text-primary-foreground scale-100 opacity-100"
                                : "bg-background/60 text-muted-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            }`}
                            title="Sélectionner"
                          >
                            {imageSelected && <Check className="w-3 h-3" />}
                          </button>

                          {/* Type badge */}
                          <div className="absolute top-1.5 left-1.5">
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/80 backdrop-blur-sm text-[9px] font-bold text-white uppercase">
                              <Image className="w-2.5 h-2.5" />
                              IMG
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute top-1.5 right-11 flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleImageToVideo(img); }}
                                className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                                title="Animer en vidéo"
                              >
                                <Film className="w-3 h-3 text-white" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate("/studio/multi-plan", { state: { sourceImage: img.url } }); }}
                                className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                                title="Multi-Shot"
                              >
                                <Camera className="w-3 h-3 text-white" />
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
                      </div>
                    );
                  }

                  if (item.type === "video") {
                    const vid = item.data as GeneratedVideo;
                    const videoSelectionKey = getVideoSelectionKey(vid);
                    const videoSelected = selectedGalleryItems.has(videoSelectionKey);

                    return (
                      <motion.div
                        key={`vid-${i}-${item.ts}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`aspect-square relative group rounded-xl overflow-hidden cursor-pointer`}
                        onClick={() => {
                          if (selectionCount > 0) {
                            toggleSelection(videoSelectionKey);
                            return;
                          }
                          setPreviewVideo(vid);
                        }}
                      >
                        <video src={vid.url} muted className="w-full h-full object-cover rounded-xl pointer-events-none" />

                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(videoSelectionKey);
                          }}
                          className={`absolute top-1.5 right-1.5 z-20 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                            videoSelected
                              ? "bg-primary text-primary-foreground scale-100 opacity-100"
                              : "bg-background/60 text-muted-foreground opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                          }`}
                          title="Sélectionner"
                        >
                          {videoSelected && <Check className="w-3 h-3" />}
                        </button>

                        {/* Type badge */}
                        <div className="absolute top-1.5 left-1.5 z-10">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/80 backdrop-blur-sm text-[9px] font-bold text-white uppercase">
                            <Video className="w-2.5 h-2.5" />
                            VID
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <div className="absolute top-1.5 right-11 flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(vid.url, i); }}
                              className="w-6 h-6 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-3 h-3 text-white" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                            <span className="text-[10px] text-white/80 font-medium truncate flex-1">{vid.prompt || ""}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteVideo(vid); }}
                                className="w-7 h-7 rounded-lg bg-destructive/20 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/40 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }

                  if (item.type === "audio") {
                    const aud = item.data as GeneratedAudio;
                    const model = aud.modelId ? getModelById(aud.modelId) : null;
                    return (
                      <motion.div
                        key={`aud-${i}-${item.ts}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full glass rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-500/80 backdrop-blur-sm text-[9px] font-bold text-white uppercase shrink-0">
                            <Music className="w-2.5 h-2.5" />
                            AUD
                          </span>
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
                  }

                  return null;
                })}
              </div>
            );
          })()}
        </div>
      </div>

      <AnimatePresence>
        {selectionCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-2xl"
          >
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {selectionCount} sélectionné{selectionCount > 1 ? "s" : ""}
            </span>

            <div className="w-px h-5 bg-border" />

            {/* Download */}
            {selectionCount >= 2 && (
              <button
                onClick={handleBatchDownload}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-1.5 text-foreground"
                title="Télécharger tout"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
            )}

            {/* Move to project */}
            <div className="relative">
              <button
                onClick={() => setShowMoveProjectModal((p) => !p)}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-1.5 text-foreground"
                title="Déplacer vers un projet"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Projet</span>
              </button>
              {showMoveProjectModal && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleMoveToProject(p.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-foreground"
                    >
                      {p.name}
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <span className="px-3 py-2 text-sm text-muted-foreground block">Aucun projet</span>
                  )}
                </div>
              )}
            </div>

            {/* Send to video (exactly 2 images) */}
            {(() => {
              const selectedImageKeys = Array.from(selectedGalleryItems).filter((k) => k.startsWith("image:"));
              const selectedVideoKeys = Array.from(selectedGalleryItems).filter((k) => k.startsWith("video:"));
              if (selectedImageKeys.length === 2 && selectedVideoKeys.length === 0) {
                return (
                  <button
                    onClick={handleSendToVideoStartEnd}
                    className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-1.5 text-foreground"
                    title="Envoyer vers Vidéo (Start & End)"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Start & End</span>
                  </button>
                );
              }
              return null;
            })()}

            <div className="w-px h-5 bg-border" />

            {/* Delete */}
            <button
              onClick={handleBatchDeleteSelection}
              disabled={batchDeletingSelection}
              className="px-3 py-1.5 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {batchDeletingSelection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Supprimer</span>
            </button>

            {/* Cancel */}
            <button
              onClick={clearSelection}
              className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== VIDEO PREVIEW MODAL ===== */}
      <AnimatePresence>
        {previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-xl"
              />
              {previewVideo.prompt && (
                <p className="text-sm text-white/70 max-w-md truncate">{previewVideo.prompt}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(previewVideo.url, 0)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Auth Gate Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Connecte-toi pour générer</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Crée un compte gratuit ou connecte-toi pour commencer à générer des images, vidéos et audios avec l'IA.
              </p>
              <a
                href="/auth"
                className="btn-generate w-full flex items-center justify-center gap-2 text-sm py-3"
              >
                <Sparkles className="w-4 h-4" />
                Se connecter / S'inscrire
              </a>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continuer à explorer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Gate Modal */}
      <AnimatePresence>
        {showCreditsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCreditsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-border"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Crédits insuffisants</h3>
              <p className="text-muted-foreground text-sm mb-2">
                Il te faut <span className="font-bold text-foreground">{calculateCaurisCost(selectedModel, modelSettings, numImages)} cauris</span> pour cette génération.
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Ton solde actuel : <span className="font-bold text-foreground">{balance} cauris</span>
              </p>
              <a
                href="/pricing"
                className="btn-generate w-full flex items-center justify-center gap-2 text-sm py-3"
              >
                <Wand2 className="w-4 h-4" />
                Acheter des cauris
              </a>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        accept={["image", "video", "audio"]}
        onSelect={(url, item) => {
          const maxInput = selectedModel.maxInputImages || 1;
          if (referenceImages.length >= maxInput) {
            toast.error(`Maximum ${maxInput} images pour ce modèle`);
            return;
          }
          // Use the signed display URL for preview, and the R2 URL for the actual reference
          const displayUrl = item.displayUrl || url;
          setReferenceImages((prev) => [...prev, displayUrl]);
          setReferencePreviews((prev) => [...prev, displayUrl]);
          toast.success("Média ajouté comme référence !");
        }}
      />
    </div>
  );
};

export default Dashboard;
