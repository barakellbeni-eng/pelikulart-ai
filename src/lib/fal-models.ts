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

export type ModelType = "image" | "video" | "audio";

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
  maxInputImages?: number; // Max number of reference images (default 1 if supportsImageInput)
  maxImages?: number;
  caurisCost: number; // Base cost in Cauris (5s for video)
  caurisCost10s?: number;
  caurisCost15s?: number;
  estimatedTime: string; // e.g. "~3s", "~15s", "~2min"
  recommended?: boolean; // Show as popular/recommended
}

// ─── Shared setting presets ───
const ASPECT_RATIO_STANDARD: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical / Réels" },
    { value: "1:1", label: "1:1 — Carré / Instagram" }, { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
    { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
    { value: "21:9", label: "21:9 — Ultra-wide" },
  ],
  defaultValue: "16:9",
};

// Aspect ratios for Flux Pro Ultra, Kontext etc (includes 9:21)
const ASPECT_RATIO_FLUX_PRO: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
    { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
    { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
    { value: "21:9", label: "21:9 — Ultra-wide" }, { value: "9:21", label: "9:21 — Ultra-vertical" },
  ],
  defaultValue: "1:1",
};

// Aspect ratios for Nano Banana Pro (Google)
const ASPECT_RATIO_NANO_BANANA: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
    { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
    { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
    { value: "4:5", label: "4:5 — Portrait social" }, { value: "5:4", label: "5:4 — Paysage doux" },
    { value: "21:9", label: "21:9 — Ultra-wide" },
  ],
  defaultValue: "1:1",
};

// Aspect ratios for Imagen 4 (Google)
const ASPECT_RATIO_IMAGEN4: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
    { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
  ],
  defaultValue: "1:1",
};

// Aspect ratios for Ideogram V2
const ASPECT_RATIO_IDEOGRAM: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
    { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
    { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
    { value: "16:10", label: "16:10 — Écran large" }, { value: "10:16", label: "10:16 — Vertical large" },
    { value: "3:1", label: "3:1 — Panorama" }, { value: "1:3", label: "1:3 — Bannière verticale" },
  ],
  defaultValue: "1:1",
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
  // ════════════════════════════════════════
  //  IMAGE MODELS
  // ════════════════════════════════════════

  // ── Pelikulart Maison (Google AI Studio direct) ──
  {
    id: "pelikulart-nano-banana", type: "image", brand: "Pelikulart", name: "Nano Banana",
    endpoint: "google-direct",
    description: "Gemini Flash Image — API maison, rapide", icon: "★", color: "from-primary/30 to-primary/10",
    maxImages: 4, supportsImageInput: true, maxInputImages: 1, caurisCost: 2, estimatedTime: "~3s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "2K" },
    ],
  },

  {
    id: "nano-banana-pro", type: "image", brand: "Google", name: "Nano Banana Pro",
    endpoint: "fal-ai/nano-banana-pro",
    description: "Gemini 3 Pro Image — rapide, polyvalent, multi-ratio", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 3, estimatedTime: "~3s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "2K" },
    ],
  },
  {
    id: "nano-banana-pro-edit", type: "image", brand: "Google", name: "Nano Banana Pro Edit",
    endpoint: "fal-ai/nano-banana-pro/edit",
    description: "Édition multi-images avec Gemini 3 Pro", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 5, caurisCost: 4, estimatedTime: "~4s",
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "2K" },
    ],
  },
  {
    id: "flux-dev", type: "image", brand: "FLUX", name: "[dev]",
    endpoint: "fal-ai/flux/dev",
    description: "Haute qualité, rendu détaillé", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 5, estimatedTime: "~10s", recommended: true,
    settings: [IMAGE_SIZE_FLUX, INFERENCE_STEPS(), GUIDANCE_SCALE, SEED_SETTING],
  },
  {
    id: "flux-schnell", type: "image", brand: "FLUX", name: "[schnell]",
    endpoint: "fal-ai/flux/schnell",
    description: "Ultra rapide, 4 étapes", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 2, estimatedTime: "~2s",
    settings: [
      IMAGE_SIZE_FLUX,
      { key: "num_inference_steps", label: "Étapes", type: "slider", min: 1, max: 12, step: 1, defaultValue: 4 },
    ],
  },
  {
    id: "flux-pro-ultra", type: "image", brand: "FLUX", name: "Pro v1.1 Ultra",
    endpoint: "fal-ai/flux-pro/v1.1-ultra",
    description: "Qualité maximale, résolution 2K", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 12, estimatedTime: "~15s",
    settings: [
      ASPECT_RATIO_FLUX_PRO,
      { key: "raw", label: "Mode Raw (moins stylisé)", type: "toggle", defaultValue: false },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-kontext", type: "image", brand: "FLUX", name: "Kontext [pro]",
    endpoint: "fal-ai/flux-pro/kontext",
    description: "Édition contextuelle (1 image)", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, maxInputImages: 1, caurisCost: 8, estimatedTime: "~10s",
    settings: [
      ASPECT_RATIO_FLUX_PRO,
      INFERENCE_STEPS(), GUIDANCE_SCALE,
      { key: "output_format", label: "Format", type: "select", options: [
        { value: "png", label: "PNG" }, { value: "jpeg", label: "JPEG" }, { value: "webp", label: "WebP" },
      ], defaultValue: "png" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-kontext-max", type: "image", brand: "FLUX", name: "Kontext [max]",
    endpoint: "fal-ai/flux-pro/kontext/max",
    description: "Typographie améliorée (1 image)", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, maxInputImages: 1, caurisCost: 12, estimatedTime: "~15s",
    settings: [
      ASPECT_RATIO_FLUX_PRO,
      GUIDANCE_SCALE,
      { key: "output_format", label: "Format", type: "select", options: [
        { value: "png", label: "PNG" }, { value: "jpeg", label: "JPEG" }, { value: "webp", label: "WebP" },
      ], defaultValue: "png" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux2-dev", type: "image", brand: "FLUX", name: "2 [dev]",
    endpoint: "fal-ai/flux-2/dev",
    description: "Dernière version, texte vers image", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 5, estimatedTime: "~12s",
    settings: [IMAGE_SIZE_FLUX, INFERENCE_STEPS(), GUIDANCE_SCALE, SEED_SETTING],
  },
  {
    id: "flux2-dev-edit", type: "image", brand: "FLUX", name: "2 [dev] Edit",
    endpoint: "fal-ai/flux-2/edit",
    description: "Édition multi-images avec FLUX 2", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, maxInputImages: 5, caurisCost: 6, estimatedTime: "~12s",
    settings: [
      IMAGE_SIZE_FLUX, INFERENCE_STEPS(),
      { key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 20, step: 0.5, defaultValue: 2.5 } as ModelSetting,
      SEED_SETTING,
    ],
  },
  {
    id: "imagen4", type: "image", brand: "Google", name: "Imagen 4",
    endpoint: "fal-ai/imagen4/preview",
    description: "Images hyper-détaillées par Google", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 8, estimatedTime: "~8s", recommended: true,
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "imagen4-fast", type: "image", brand: "Google", name: "Imagen 4 Fast",
    endpoint: "fal-ai/imagen4/preview/fast",
    description: "Version rapide, meilleur rapport qualité/prix", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 6, estimatedTime: "~4s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "imagen4-ultra", type: "image", brand: "Google", name: "Imagen 4 Ultra",
    endpoint: "fal-ai/imagen4/preview/ultra",
    description: "Qualité maximale, détails extrêmes", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 10, estimatedTime: "~12s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "seedream-v4-t2i", type: "image", brand: "Seedream", name: "v4",
    endpoint: "fal-ai/bytedance/seedream/v4/text-to-image",
    description: "Génération rapide et photoréaliste", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 5, estimatedTime: "~4s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
        { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
      ], defaultValue: "1:1" },
      { key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 15, step: 0.5, defaultValue: 7 },
      { key: "num_inference_steps", label: "Étapes", type: "slider", min: 10, max: 50, step: 1, defaultValue: 30 },
      { key: "negative_prompt", label: "Prompt négatif", type: "text", defaultValue: "", description: "Éléments à exclure" },
      SEED_SETTING,
    ],
  },
  {
    id: "seedream-v4-edit", type: "image", brand: "Seedream", name: "v4 Edit",
    endpoint: "fal-ai/bytedance/seedream/v4/edit",
    description: "Édition multi-images intelligente", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, maxInputImages: 10, caurisCost: 5, estimatedTime: "~5s",
    settings: [
      { key: "strength", label: "Force d'édition", type: "slider", min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.7 },
      SEED_SETTING,
    ],
  },
  {
    id: "seedream-v45-t2i", type: "image", brand: "Seedream", name: "v4.5",
    endpoint: "fal-ai/bytedance/seedream/v4.5/text-to-image",
    description: "Dernière version, ultra réaliste 2-3s", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 6, estimatedTime: "~3s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
        { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
      ], defaultValue: "1:1" },
      { key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 15, step: 0.5, defaultValue: 7 },
      { key: "num_inference_steps", label: "Étapes", type: "slider", min: 10, max: 50, step: 1, defaultValue: 30 },
      { key: "negative_prompt", label: "Prompt négatif", type: "text", defaultValue: "", description: "Éléments à exclure" },
      SEED_SETTING,
    ],
  },
  {
    id: "seedream-v45-edit", type: "image", brand: "Seedream", name: "v4.5 Edit",
    endpoint: "fal-ai/bytedance/seedream/v4.5/edit",
    description: "Édition multi-images dernière génération", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, maxInputImages: 10, caurisCost: 6, estimatedTime: "~4s",
    settings: [
      { key: "strength", label: "Force d'édition", type: "slider", min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.7 },
      SEED_SETTING,
    ],
  },

  // ════════════════════════════════════════
  //  VIDEO MODELS
  // ════════════════════════════════════════

  {
    id: "veo3", type: "video", brand: "Google", name: "Veo 3",
    endpoint: "fal-ai/veo3",
    description: "Vidéo haute qualité avec audio", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 150, caurisCost10s: 300, estimatedTime: "~2min", recommended: true,
    settings: [
      { key: "duration", label: "Durée", type: "select", options: [{ value: "5", label: "5s" }, { value: "8", label: "8s" }], defaultValue: "8" },
      { ...ASPECT_RATIO_STANDARD },
      { key: "include_audio", label: "Inclure l'audio", type: "toggle", defaultValue: true },
    ],
  },
  {
    id: "kling-v3-std-t2v", type: "video", brand: "Kling", name: "v3 Standard",
    endpoint: "fal-ai/kling-video/v3/standard/text-to-video",
    description: "Dernière génération, cinématique", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 40, caurisCost10s: 80, estimatedTime: "~1min",
    settings: [
      DURATION_5_10, { ...ASPECT_RATIO_STANDARD },
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: false },
    ],
  },
  {
    id: "kling-v3-pro-t2v", type: "video", brand: "Kling", name: "v3 Pro",
    endpoint: "fal-ai/kling-video/v3/pro/text-to-video",
    description: "Qualité maximale, rendu cinéma", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 200, caurisCost10s: 400, estimatedTime: "~3min",
    settings: [
      DURATION_5_10, { ...ASPECT_RATIO_STANDARD },
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: false },
    ],
  },
  {
    id: "kling-v25-turbo-i2v", type: "video", brand: "Kling", name: "v2.5 Turbo (I2V)",
    endpoint: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    description: "Anime vos images en vidéo fluide", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 50, caurisCost10s: 100, estimatedTime: "~30s",
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v21-std-i2v", type: "video", brand: "Kling", name: "v2.1 Standard (I2V)",
    endpoint: "fal-ai/kling-video/v2.1/standard/image-to-video",
    description: "Image vers vidéo, bon rapport qualité/prix", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 35, caurisCost10s: 70, estimatedTime: "~45s",
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v2-master-t2v", type: "video", brand: "Kling", name: "v2 Master",
    endpoint: "fal-ai/kling-video/v2/master/text-to-video",
    description: "Texte vers vidéo haute qualité", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 60, caurisCost10s: 120, estimatedTime: "~1min30",
    settings: [DURATION_5_10, { ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "kling-v16-std-t2v", type: "video", brand: "Kling", name: "v1.6 Standard",
    endpoint: "fal-ai/kling-video/v1.6/standard/text-to-video",
    description: "Vidéos réalistes, mouvements naturels", icon: "□", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 25, caurisCost10s: 50, estimatedTime: "~40s",
    settings: [DURATION_5_10, { ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "kling-v16-elements", type: "video", brand: "Kling", name: "v1.6 Elements (Multi-I2V)",
    endpoint: "fal-ai/kling-video/v1.6/standard/elements",
    description: "Combine jusqu'à 4 images en vidéo", icon: "▤", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 35, caurisCost10s: 70, estimatedTime: "~45s",
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-pro-t2v", type: "video", brand: "Seedance", name: "v1 Pro",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/text-to-video",
    description: "Haute qualité, multi-ratios", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 70, caurisCost10s: 140, estimatedTime: "~1min30",
    settings: [
      DURATION_5_10,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "seedance-pro-i2v", type: "video", brand: "Seedance", name: "v1 Pro (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
    description: "Image vers vidéo haute qualité", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140, estimatedTime: "~1min30",
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-pro-fast-t2v", type: "video", brand: "Seedance", name: "v1 Pro Fast",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
    description: "Génération rapide et efficace", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 45, caurisCost10s: 90, estimatedTime: "~30s",
    settings: [
      DURATION_5_10,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "seedance-pro-fast-i2v", type: "video", brand: "Seedance", name: "v1 Pro Fast (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
    description: "Anime vos images rapidement", icon: "△", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90, estimatedTime: "~30s",
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-15-pro-i2v", type: "video", brand: "Seedance", name: "v1.5 Pro (I2V + Audio)",
    endpoint: "fal-ai/bytedance/seedance/v1.5/pro/image-to-video",
    description: "Image vers vidéo avec audio", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140, estimatedTime: "~1min30",
    settings: [
      DURATION_5_10,
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: true },
    ],
  },
  {
    id: "seedance-lite-i2v", type: "video", brand: "Seedance", name: "v1 Lite (I2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/lite/image-to-video",
    description: "Animation légère et économique", icon: "▽", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 30, caurisCost10s: 60, estimatedTime: "~20s",
    settings: [DURATION_5_10],
  },
  {
    id: "seedance-lite-ref", type: "video", brand: "Seedance", name: "v1 Lite Reference (R2V)",
    endpoint: "fal-ai/bytedance/seedance/v1/lite/reference-to-video",
    description: "1-4 images de référence vers vidéo", icon: "▤", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 30, caurisCost10s: 60, estimatedTime: "~20s",
    settings: [DURATION_5_10],
  },
  {
    id: "luma-ray2-t2v", type: "video", brand: "Luma", name: "Ray 2",
    endpoint: "fal-ai/luma-dream-machine/ray-2",
    description: "Visuels réalistes, mouvement cohérent", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 60, estimatedTime: "~1min",
    settings: [{ ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "luma-ray2-i2v", type: "video", brand: "Luma", name: "Ray 2 (I2V)",
    endpoint: "fal-ai/luma-dream-machine/ray-2/image-to-video",
    description: "Anime vos images avec réalisme", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 60, estimatedTime: "~1min",
    settings: [{ ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "wan-26-t2v", type: "video", brand: "Wan", name: "v2.6",
    endpoint: "fal-ai/wan/v2.6/1080p/text-to-video",
    description: "Jusqu'à 15s en 1080p", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 45, caurisCost10s: 90, caurisCost15s: 135, estimatedTime: "~1min",
    settings: [
      DURATION_5_10_15,
      { ...ASPECT_RATIO_STANDARD },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "wan-26-i2v", type: "video", brand: "Wan", name: "v2.6 (I2V)",
    endpoint: "fal-ai/wan/v2.6/1080p/image-to-video",
    description: "Image vers vidéo jusqu'à 15s", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90, caurisCost15s: 135, estimatedTime: "~1min",
    settings: [
      DURATION_5_10_15,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },
  {
    id: "minimax-video", type: "video", brand: "MiniMax", name: "Video-01 Live",
    endpoint: "fal-ai/minimax/video-01-live",
    description: "Vidéo fluide et expressive", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 60, estimatedTime: "~1min",
    settings: [
      { key: "prompt_optimizer", label: "Optimiser le prompt", type: "toggle", defaultValue: true },
    ],
  },
  {
    id: "framepack-f1", type: "video", brand: "Framepack", name: "F1",
    endpoint: "fal-ai/framepack/f1",
    description: "Animation réaliste d'images", icon: "□", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 15, estimatedTime: "~20s",
    settings: [INFERENCE_STEPS(25), SEED_SETTING],
  },

  // ════════════════════════════════════════
  //  AUDIO MODELS
  // ════════════════════════════════════════

  {
    id: "stable-audio", type: "audio", brand: "Stability", name: "Stable Audio",
    endpoint: "fal-ai/stable-audio",
    description: "Musique et bruitages jusqu'à 47s", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 5, estimatedTime: "~10s",
    settings: [
      { key: "audio_type", label: "Type", type: "select", options: [
        { value: "music", label: "Musique" }, { value: "sfx", label: "Bruitage/SFX" },
      ], defaultValue: "music" },
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 5, max: 47, step: 1, defaultValue: 15 },
      { key: "num_inference_steps", label: "Étapes", type: "slider", min: 10, max: 50, step: 1, defaultValue: 25 },
    ],
  },
  {
    id: "ace-step", type: "audio", brand: "Ace", name: "Ace Step",
    endpoint: "fal-ai/ace-step",
    description: "Génère des chansons avec paroles", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 12, estimatedTime: "~30s",
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 15, max: 120, step: 5, defaultValue: 30 },
      { key: "lyrics", label: "Paroles (optionnel)", type: "text", defaultValue: "", description: "Paroles de la chanson" },
    ],
  },
  {
    id: "dia-tts", type: "audio", brand: "Nari", name: "Dia TTS",
    endpoint: "fal-ai/dia-tts",
    description: "Voix multi-locuteurs naturelle", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 3, estimatedTime: "~5s",
    settings: [],
  },
  {
    id: "kokoro-tts", type: "audio", brand: "Kokoro", name: "TTS",
    endpoint: "fal-ai/kokoro/american-english",
    description: "Voix rapide et naturelle", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 2, estimatedTime: "~3s",
    settings: [
      { key: "voice", label: "Voix", type: "select", options: [
        { value: "af_heart", label: "Heart (F)" }, { value: "af_bella", label: "Bella (F)" },
        { value: "am_adam", label: "Adam (M)" }, { value: "am_michael", label: "Michael (M)" },
      ], defaultValue: "af_heart" },
    ],
  },
  {
    id: "mmaudio", type: "audio", brand: "MMAudio", name: "V2",
    endpoint: "fal-ai/mmaudio/v2",
    description: "Audio synchronisé à une vidéo", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 8, estimatedTime: "~10s",
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 1, max: 15, step: 1, defaultValue: 5 },
    ],
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
  let cost = model.caurisCost;

  if (model.type === "video") {
    const duration = settings.duration ? parseInt(settings.duration) : 5;
    if (duration >= 15 && model.caurisCost15s) cost = model.caurisCost15s;
    else if (duration >= 10 && model.caurisCost10s) cost = model.caurisCost10s;

    // Resolution surcharge
    if (settings.resolution === "1080p") cost = Math.ceil(cost * 1.3);

    // Audio generation surcharge
    if (settings.generate_audio === true || settings.include_audio === true) cost = Math.ceil(cost * 1.2);

    return cost;
  }

  // Image models
  // Resolution surcharge
  if (settings.resolution === "4K") cost = Math.ceil(cost * 1.8);
  else if (settings.resolution === "2K") cost = Math.ceil(cost * 1.2);

  // Higher inference steps surcharge (above default)
  const stepsDefault = model.settings.find(s => s.key === "num_inference_steps")?.defaultValue;
  if (stepsDefault && settings.num_inference_steps > stepsDefault) {
    const ratio = settings.num_inference_steps / stepsDefault;
    if (ratio > 1.3) cost = Math.ceil(cost * 1.3);
  }

  // Raw mode (FLUX Pro Ultra)
  if (settings.raw === true) cost = Math.ceil(cost * 1.2);

  // Larger image sizes
  if (settings.image_size === "landscape_16_9" || settings.image_size === "portrait_16_9") {
    cost = Math.ceil(cost * 1.15);
  }

  return cost * numImages;
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
