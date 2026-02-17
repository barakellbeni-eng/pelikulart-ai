// Fal AI Models Configuration

export interface ModelSetting {
  key: string;
  label: string;
  type: "select" | "slider" | "toggle" | "text";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
  description?: string;
}

export type ModelType = "image" | "video";

export interface FalModel {
  id: string;
  name: string;
  brand: string;
  endpoint: string;
  description: string;
  icon: string;
  color: string;
  type: ModelType;
  settings: ModelSetting[];
  supportsImageInput?: boolean;
  maxImages?: number;
  caurisCost: number; // Base cost in Cauris (5s for video)
  caurisCost10s?: number;
  caurisCost15s?: number;
}

// ─── Shared setting presets ───
const ASPECT_RATIO_STANDARD: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" },
    { value: "1:1", label: "1:1" }, { value: "4:3", label: "4:3" }, { value: "3:4", label: "3:4" },
  ],
  defaultValue: "16:9",
};

const DURATION_5_10: ModelSetting = {
  key: "duration", label: "Durée", type: "select",
  options: [{ value: "5", label: "5s" }, { value: "10", label: "10s" }],
  defaultValue: "5",
};

const DURATION_5_10_15: ModelSetting = {
  key: "duration", label: "Durée", type: "select",
  options: [{ value: "5", label: "5s" }, { value: "10", label: "10s" }, { value: "15", label: "15s" }],
  defaultValue: "5",
};

const IMAGE_SIZE_FLUX: ModelSetting = {
  key: "image_size", label: "Taille", type: "select",
  options: [
    { value: "square_hd", label: "Carré HD" }, { value: "square", label: "Carré" },
    { value: "portrait_4_3", label: "Portrait 4:3" }, { value: "portrait_16_9", label: "Portrait 16:9" },
    { value: "landscape_4_3", label: "Paysage 4:3" }, { value: "landscape_16_9", label: "Paysage 16:9" },
  ],
  defaultValue: "square_hd",
};

const SEED_SETTING: ModelSetting = {
  key: "seed", label: "Seed (0 = aléatoire)", type: "slider", min: 0, max: 9999999, step: 1, defaultValue: 0,
};

const GUIDANCE_SCALE: ModelSetting = {
  key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 20, step: 0.5, defaultValue: 3.5,
};

const INFERENCE_STEPS = (def = 28, max = 50): ModelSetting => ({
  key: "num_inference_steps", label: "Étapes d'inférence", type: "slider", min: 10, max, step: 1, defaultValue: def,
});

// ════════════════════════════════════════
//  IMAGE MODELS
// ════════════════════════════════════════

export const FAL_MODELS: FalModel[] = [
  // ── Nano Banana ──
  {
    id: "nano-banana-pro", type: "image", brand: "Nano Banana", name: "Pro",
    endpoint: "fal-ai/nano-banana-pro",
    description: "Rapide et polyvalent", icon: "🍌", color: "from-yellow-500 to-orange-400",
    maxImages: 4, supportsImageInput: true, caurisCost: 3,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1" }, { value: "4:5", label: "4:5" }, { value: "5:4", label: "5:4" },
        { value: "4:3", label: "4:3" }, { value: "3:4", label: "3:4" },
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" },
      ], defaultValue: "4:5" },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "2K" },
    ],
  },

  // ── FLUX ──
  {
    id: "flux-dev", type: "image", brand: "FLUX", name: "[dev]",
    endpoint: "fal-ai/flux/dev",
    description: "Haute qualité, rendu détaillé", icon: "⚡", color: "from-blue-500 to-cyan-400",
    maxImages: 4, supportsImageInput: false, caurisCost: 5,
    settings: [IMAGE_SIZE_FLUX, INFERENCE_STEPS(), GUIDANCE_SCALE, SEED_SETTING],
  },
  {
    id: "flux-schnell", type: "image", brand: "FLUX", name: "[schnell]",
    endpoint: "fal-ai/flux/schnell",
    description: "Ultra rapide, 4 étapes", icon: "🚀", color: "from-green-500 to-emerald-400",
    maxImages: 4, supportsImageInput: false, caurisCost: 2,
    settings: [
      IMAGE_SIZE_FLUX,
      { key: "num_inference_steps", label: "Étapes", type: "slider", min: 1, max: 12, step: 1, defaultValue: 4 },
    ],
  },
  {
    id: "flux-pro-ultra", type: "image", brand: "FLUX", name: "Pro v1.1 Ultra",
    endpoint: "fal-ai/flux-pro/v1.1-ultra",
    description: "Pro 2K, qualité maximale", icon: "💎", color: "from-purple-500 to-pink-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 12,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1" }, { value: "4:3", label: "4:3" }, { value: "3:4", label: "3:4" },
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "21:9", label: "21:9" },
      ], defaultValue: "1:1" },
      { key: "raw", label: "Mode Raw (moins stylisé)", type: "toggle", defaultValue: false },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-kontext", type: "image", brand: "FLUX", name: "Kontext [pro]",
    endpoint: "fal-ai/flux-pro/kontext",
    description: "Édition contextuelle avec image", icon: "🎨", color: "from-orange-500 to-red-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 8,
    settings: [INFERENCE_STEPS(), GUIDANCE_SCALE, SEED_SETTING],
  },
  {
    id: "flux2-dev", type: "image", brand: "FLUX", name: "2 [dev]",
    endpoint: "fal-ai/flux2/dev",
    description: "Dernière génération, édition avancée", icon: "⚡", color: "from-violet-500 to-purple-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 5,
    settings: [IMAGE_SIZE_FLUX, INFERENCE_STEPS(), GUIDANCE_SCALE],
  },

  // ── Google ──
  {
    id: "imagen4", type: "image", brand: "Google", name: "Imagen 4",
    endpoint: "fal-ai/imagen4/preview",
    description: "Images hyper-détaillées", icon: "🔮", color: "from-sky-500 to-blue-400",
    maxImages: 4, supportsImageInput: false, caurisCost: 8,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1" }, { value: "3:4", label: "3:4" }, { value: "4:3", label: "4:3" },
        { value: "9:16", label: "9:16" }, { value: "16:9", label: "16:9" },
      ], defaultValue: "1:1" },
    ],
  },

  // ── Recraft ──
  {
    id: "recraft-v3", type: "image", brand: "Recraft", name: "V3",
    endpoint: "fal-ai/recraft/v3",
    description: "SOTA, styles variés, texte dans l'image", icon: "🖌️", color: "from-rose-500 to-fuchsia-400",
    maxImages: 2, supportsImageInput: false, caurisCost: 8,
    settings: [
      { key: "style", label: "Style", type: "select", options: [
        { value: "realistic_image", label: "Réaliste" }, { value: "digital_illustration", label: "Illustration digitale" },
        { value: "vector_illustration", label: "Illustration vectorielle" }, { value: "icon", label: "Icône" },
      ], defaultValue: "realistic_image" },
      { key: "image_size", label: "Taille", type: "select", options: [
        { value: "1024x1024", label: "1024×1024" }, { value: "1365x1024", label: "1365×1024" },
        { value: "1024x1365", label: "1024×1365" }, { value: "1536x1024", label: "1536×1024" }, { value: "1024x1536", label: "1024×1536" },
      ], defaultValue: "1024x1024" },
    ],
  },

  // ── Ideogram ──
  {
    id: "ideogram-v2", type: "image", brand: "Ideogram", name: "V2",
    endpoint: "fal-ai/ideogram/v2",
    description: "Excellent pour le texte dans les images", icon: "✍️", color: "from-indigo-500 to-blue-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 15,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1" }, { value: "4:3", label: "4:3" }, { value: "3:4", label: "3:4" },
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "3:2", label: "3:2" }, { value: "2:3", label: "2:3" },
      ], defaultValue: "1:1" },
      { key: "style_type", label: "Type de style", type: "select", options: [
        { value: "auto", label: "Auto" }, { value: "general", label: "Général" }, { value: "realistic", label: "Réaliste" },
        { value: "design", label: "Design" }, { value: "render_3d", label: "Rendu 3D" }, { value: "anime", label: "Anime" },
      ], defaultValue: "auto" },
      { key: "negative_prompt", label: "Prompt négatif", type: "text", defaultValue: "", description: "Ce que vous ne voulez PAS" },
    ],
  },

  // ── Stable Diffusion ──
  {
    id: "fast-sdxl", type: "image", brand: "Stable Diffusion", name: "Fast SDXL",
    endpoint: "fal-ai/fast-sdxl",
    description: "Rapide, très personnalisable", icon: "🎯", color: "from-amber-500 to-yellow-400",
    maxImages: 4, supportsImageInput: false, caurisCost: 3,
    settings: [
      IMAGE_SIZE_FLUX, INFERENCE_STEPS(25), 
      { key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 20, step: 0.5, defaultValue: 7.5 },
      { key: "negative_prompt", label: "Prompt négatif", type: "text", defaultValue: "", description: "Ce que vous ne voulez PAS" },
      SEED_SETTING,
    ],
  },

  // ── HiDream ──
  {
    id: "hidream-i1", type: "image", brand: "HiDream", name: "I1 Full",
    endpoint: "fal-ai/hidream-i1-full",
    description: "Open-source haute qualité", icon: "🌈", color: "from-teal-500 to-cyan-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 6,
    settings: [
      IMAGE_SIZE_FLUX, INFERENCE_STEPS(),
      { key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 15, step: 0.5, defaultValue: 5 },
      SEED_SETTING,
    ],
  },

  // ════════════════════════════════════════
  //  VIDEO MODELS
  // ════════════════════════════════════════

  // ── Google ──
  {
    id: "veo3", type: "video", brand: "Google", name: "Veo 3",
    endpoint: "fal-ai/veo3",
    description: "Vidéo haute qualité avec audio", icon: "🎬", color: "from-red-500 to-rose-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 150, caurisCost10s: 300,
    settings: [
      { key: "duration", label: "Durée", type: "select", options: [{ value: "5", label: "5s" }, { value: "8", label: "8s" }], defaultValue: "8" },
      { ...ASPECT_RATIO_STANDARD },
      { key: "include_audio", label: "Inclure l'audio", type: "toggle", defaultValue: true },
    ],
  },

  // ── Kling ──
  {
    id: "kling-v3-std-t2v", type: "video", brand: "Kling", name: "3.0 Standard (T2V)",
    endpoint: "fal-ai/kling-video/v3/standard/text-to-video",
    description: "Dernière génération, cinématique + audio", icon: "🎬", color: "from-emerald-500 to-green-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 40, caurisCost10s: 80,
    settings: [
      DURATION_5_10, { ...ASPECT_RATIO_STANDARD },
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: false },
    ],
  },
  {
    id: "kling-v3-pro-t2v", type: "video", brand: "Kling", name: "3.0 Pro (T2V)",
    endpoint: "fal-ai/kling-video/o3/pro/text-to-video",
    description: "Pro cinématique, qualité max", icon: "💎", color: "from-emerald-600 to-teal-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 200, caurisCost10s: 400,
    settings: [
      DURATION_5_10, { ...ASPECT_RATIO_STANDARD },
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: false },
    ],
  },
  {
    id: "kling-v25-turbo-i2v", type: "video", brand: "Kling", name: "2.5 Turbo Pro (I2V)",
    endpoint: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    description: "Image vers vidéo, fluidité cinématique", icon: "⚡", color: "from-lime-500 to-emerald-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 50, caurisCost10s: 100,
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v21-std-i2v", type: "video", brand: "Kling", name: "2.1 Standard (I2V)",
    endpoint: "fal-ai/kling-video/v2.1/standard/image-to-video",
    description: "Image vers vidéo, bon rapport qualité/prix", icon: "🎞️", color: "from-green-500 to-lime-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 35, caurisCost10s: 70,
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v2-master-t2v", type: "video", brand: "Kling", name: "2.0 Master (T2V)",
    endpoint: "fal-ai/kling-video/v2/master/text-to-video",
    description: "Text-to-video haute qualité", icon: "🏆", color: "from-teal-500 to-green-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 60, caurisCost10s: 120,
    settings: [DURATION_5_10, { ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "kling-v16-std-t2v", type: "video", brand: "Kling", name: "1.6 Standard (T2V)",
    endpoint: "fal-ai/kling-video/v1.6/standard/text-to-video",
    description: "Vidéos réalistes, mouvements naturels", icon: "🎥", color: "from-green-400 to-emerald-300",
    maxImages: 1, supportsImageInput: false, caurisCost: 25, caurisCost10s: 50,
    settings: [DURATION_5_10, { ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "kling-v16-elements", type: "video", brand: "Kling", name: "1.6 Elements (Multi-I2V)",
    endpoint: "fal-ai/kling-video/v1.6/standard/elements",
    description: "Multi-images vers vidéo (jusqu'à 4)", icon: "🧩", color: "from-emerald-400 to-cyan-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 35, caurisCost10s: 70,
    settings: [DURATION_5_10],
  },

  // ── Seedance (Bytedance) ──
  {
    id: "seedance-pro-t2v", type: "video", brand: "Seedance", name: "1.0 Pro (T2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/text-to-video",
    description: "Haute qualité, multi-ratios", icon: "🌱", color: "from-green-500 to-teal-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 70, caurisCost10s: 140,
    settings: [
      DURATION_5_10,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "seedance-pro-i2v", type: "video", brand: "Seedance", name: "1.0 Pro (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    description: "Image vers vidéo haute qualité", icon: "🌿", color: "from-teal-500 to-emerald-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140,
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-pro-fast-t2v", type: "video", brand: "Seedance", name: "1.0 Pro Fast (T2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
    description: "Rapide et efficace", icon: "⚡", color: "from-lime-500 to-green-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 45, caurisCost10s: 90,
    settings: [
      DURATION_5_10,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "seedance-pro-fast-i2v", type: "video", brand: "Seedance", name: "1.0 Pro Fast (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
    description: "Image vers vidéo rapide", icon: "🚀", color: "from-cyan-500 to-green-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90,
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-15-pro-i2v", type: "video", brand: "Seedance", name: "1.5 Pro (I2V + Audio)",
    endpoint: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    description: "Image vers vidéo avec audio", icon: "🔊", color: "from-teal-600 to-cyan-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140,
    settings: [
      DURATION_5_10,
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: true },
    ],
  },
  {
    id: "seedance-lite-i2v", type: "video", brand: "Seedance", name: "1.0 Lite (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/lite/image-to-video",
    description: "Léger, animation d'image", icon: "🍃", color: "from-green-400 to-lime-300",
    maxImages: 1, supportsImageInput: true, caurisCost: 30, caurisCost10s: 60,
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-lite-ref", type: "video", brand: "Seedance", name: "1.0 Lite Référence (R2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/lite/reference-to-video",
    description: "1-4 images de référence vers vidéo", icon: "🎭", color: "from-emerald-400 to-teal-300",
    maxImages: 1, supportsImageInput: true, caurisCost: 30, caurisCost10s: 60,
    settings: [DURATION_5_10],
  },

  // ── Luma (Ray2) ──
  {
    id: "luma-ray2-t2v", type: "video", brand: "Luma", name: "Ray 2 (T2V)",
    endpoint: "fal-ai/luma-dream-machine/ray-2",
    description: "Visuals réalistes, mouvement cohérent", icon: "🌟", color: "from-violet-500 to-purple-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 60,
    settings: [{ ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "luma-ray2-i2v", type: "video", brand: "Luma", name: "Ray 2 (I2V)",
    endpoint: "fal-ai/luma-dream-machine/ray-2/image-to-video",
    description: "Image vers vidéo cinématique", icon: "✨", color: "from-purple-500 to-violet-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 60,
    settings: [{ ...ASPECT_RATIO_STANDARD }],
  },

  // ── Wan ──
  {
    id: "wan-26-t2v", type: "video", brand: "Wan", name: "2.6 (T2V)",
    endpoint: "wan/v2.6/text-to-video",
    description: "Multi-shot, jusqu'à 15s, 1080p", icon: "🎭", color: "from-orange-500 to-amber-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 45, caurisCost10s: 90, caurisCost15s: 135,
    settings: [
      DURATION_5_10_15,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "wan-26-i2v", type: "video", brand: "Wan", name: "2.6 (I2V)",
    endpoint: "wan/v2.6/image-to-video",
    description: "Image vers vidéo, multi-shot", icon: "🖼️", color: "from-amber-500 to-orange-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90, caurisCost15s: 135,
    settings: [
      DURATION_5_10_15,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },

  // ── MiniMax ──
  {
    id: "minimax-video", type: "video", brand: "MiniMax", name: "Video 01 Live",
    endpoint: "fal-ai/minimax/video-01-live",
    description: "Vidéo fluide et expressive", icon: "🎥", color: "from-cyan-500 to-teal-400",
    maxImages: 1, supportsImageInput: false, caurisCost: 60,
    settings: [
      { key: "prompt_optimizer", label: "Optimiser le prompt", type: "toggle", defaultValue: true },
    ],
  },

  // ── Framepack ──
  {
    id: "framepack-f1", type: "video", brand: "Framepack", name: "F1",
    endpoint: "fal-ai/framepack/f1",
    description: "Image vers vidéo, animation réaliste", icon: "🖼️", color: "from-fuchsia-500 to-pink-400",
    maxImages: 1, supportsImageInput: true, caurisCost: 15,
    settings: [INFERENCE_STEPS(25), SEED_SETTING],
  },
];

// ─── Helpers ───

export function getModelById(id: string): FalModel | undefined {
  return FAL_MODELS.find((m) => m.id === id);
}

export function getDefaultSettings(model: FalModel): Record<string, any> {
  const defaults: Record<string, any> = {};
  model.settings.forEach((s) => { defaults[s.key] = s.defaultValue; });
  return defaults;
}

export function getModelsByType(type: ModelType): FalModel[] {
  return FAL_MODELS.filter((m) => m.type === type);
}

/** Calculate the actual cauris cost based on model and current settings */
export function calculateCaurisCost(model: FalModel, settings: Record<string, any>, numImages: number = 1): number {
  if (model.type === "video") {
    const duration = settings.duration ? parseInt(settings.duration) : 5;
    if (duration >= 15 && model.caurisCost15s) return model.caurisCost15s;
    if (duration >= 10 && model.caurisCost10s) return model.caurisCost10s;
    return model.caurisCost;
  }
  // Image: cost per image × number of images
  return model.caurisCost * numImages;
}

export interface BrandGroup {
  brand: string;
  models: FalModel[];
}

export function getModelsByTypeGrouped(type: ModelType): BrandGroup[] {
  const models = getModelsByType(type);
  const map = new Map<string, FalModel[]>();
  models.forEach((m) => {
    if (!map.has(m.brand)) map.set(m.brand, []);
    map.get(m.brand)!.push(m);
  });
  return Array.from(map.entries()).map(([brand, models]) => ({ brand, models }));
}
