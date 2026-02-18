// Freepik AI Models Configuration

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
  maxImages?: number;
  caurisCost: number;
  caurisCost10s?: number;
  caurisCost15s?: number;
  estimatedTime: string;
  recommended?: boolean;
}

// ─── Shared setting presets ───
const ASPECT_RATIO_STANDARD: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical / Réels" },
    { value: "1:1", label: "1:1 — Carré / Instagram" }, { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
  ],
  defaultValue: "16:9",
};

const DURATION_5_10: ModelSetting = {
  key: "duration", label: "Durée", type: "select",
  options: [{ value: "5", label: "5s" }, { value: "10", label: "10s" }],
  defaultValue: "5",
};

const IMAGE_SIZE_FREEPIK: ModelSetting = {
  key: "image_size", label: "Taille", type: "select",
  options: [
    { value: "square_1_1", label: "Carré 1:1" },
    { value: "landscape_16_9", label: "Paysage 16:9" }, { value: "portrait_9_16", label: "Portrait 9:16" },
    { value: "landscape_4_3", label: "Paysage 4:3" }, { value: "portrait_3_4", label: "Portrait 3:4" },
  ],
  defaultValue: "square_1_1",
};

const SEED_SETTING: ModelSetting = {
  key: "seed", label: "Seed (0 = aléatoire)", type: "slider", min: 0, max: 9999999, step: 1, defaultValue: 0,
};

const GUIDANCE_SCALE: ModelSetting = {
  key: "guidance_scale", label: "Guidance Scale", type: "slider", min: 1, max: 20, step: 0.5, defaultValue: 3.5,
};

const VIDEO_SIZE_720: ModelSetting = {
  key: "size", label: "Taille vidéo", type: "select",
  options: [
    { value: "1280*720", label: "1280×720 (Paysage)" },
    { value: "720*1280", label: "720×1280 (Portrait)" },
    { value: "1920*1080", label: "1920×1080 (Full HD Paysage)" },
    { value: "1080*1920", label: "1080×1920 (Full HD Portrait)" },
  ],
  defaultValue: "1280*720",
};

// ════════════════════════════════════════
//  IMAGE MODELS (Freepik)
// ════════════════════════════════════════

export const FAL_MODELS: FalModel[] = [
  {
    id: "mystic", type: "image", brand: "Freepik", name: "Mystic",
    endpoint: "freepik/mystic",
    description: "Modèle exclusif ultra-réaliste", icon: "✦", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 5, estimatedTime: "~8s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-pro-v1-1", type: "image", brand: "FLUX", name: "Pro 1.1",
    endpoint: "flux/pro-v1-1",
    description: "Qualité premium, détails fins", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 12, estimatedTime: "~15s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" }, { value: "21:9", label: "21:9 — Ultra-wide" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-2-pro", type: "image", brand: "FLUX", name: "2 Pro",
    endpoint: "flux/2-pro",
    description: "Dernière génération, image-to-image", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 10, estimatedTime: "~12s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-2-turbo", type: "image", brand: "FLUX", name: "2 Turbo",
    endpoint: "flux/2-turbo",
    description: "Rapide et économique", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 5, estimatedTime: "~5s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "flux-dev", type: "image", brand: "FLUX", name: "Dev",
    endpoint: "flux/dev",
    description: "Haute qualité, rendu détaillé", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 5, estimatedTime: "~10s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      GUIDANCE_SCALE, SEED_SETTING,
    ],
  },
  {
    id: "flux-kontext-pro", type: "image", brand: "FLUX", name: "Kontext Pro",
    endpoint: "flux/kontext-pro",
    description: "Édition contextuelle avec image", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 8, estimatedTime: "~10s",
    settings: [SEED_SETTING],
  },
  {
    id: "hyperflux", type: "image", brand: "FLUX", name: "Hyperflux",
    endpoint: "flux/hyperflux",
    description: "Ultra rapide, sub-seconde", icon: "⚡", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 3, estimatedTime: "~1s", recommended: true,
    settings: [
      IMAGE_SIZE_FREEPIK, SEED_SETTING,
    ],
  },
  {
    id: "seedream-v4", type: "image", brand: "Seedream", name: "v4",
    endpoint: "seedream/v4",
    description: "Rapide et photoréaliste", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 5, estimatedTime: "~4s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "seedream-v45", type: "image", brand: "Seedream", name: "v4.5",
    endpoint: "seedream/v4.5",
    description: "Dernière version, ultra réaliste", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 6, estimatedTime: "~3s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "4:3", label: "4:3 — Classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
      SEED_SETTING,
    ],
  },
  {
    id: "runway-t2i", type: "image", brand: "RunWay", name: "Text-to-Image",
    endpoint: "runway/t2i",
    description: "Images créatives haute qualité", icon: "□", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 10, estimatedTime: "~10s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "1:1" },
    ],
  },
  {
    id: "classic-fast", type: "image", brand: "Freepik", name: "Classic Fast",
    endpoint: "freepik/classic",
    description: "Rapide, synchrone, styles variés", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 2, estimatedTime: "~2s",
    settings: [
      IMAGE_SIZE_FREEPIK,
      { key: "styling", label: "Style", type: "select", options: [
        { value: "", label: "Aucun" }, { value: "anime", label: "Anime" }, { value: "photo", label: "Photo" },
        { value: "digital_art", label: "Art digital" }, { value: "3d_render", label: "Rendu 3D" },
      ], defaultValue: "" },
      { key: "negative_prompt", label: "Prompt négatif", type: "text", defaultValue: "", description: "Ce que vous ne voulez PAS" },
      SEED_SETTING,
    ],
  },

  // ════════════════════════════════════════
  //  VIDEO MODELS (Freepik)
  // ════════════════════════════════════════

  {
    id: "kling-v26-pro-i2v", type: "video", brand: "Kling", name: "v2.6 Pro (I2V)",
    endpoint: "kling/v2.6-pro",
    description: "Dernière génération, contrôle motion", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 100, caurisCost10s: 200, estimatedTime: "~2min", recommended: true,
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v25-pro-i2v", type: "video", brand: "Kling", name: "v2.5 Pro (I2V)",
    endpoint: "kling/v2.5-pro",
    description: "Haute qualité, mouvement réaliste", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 80, caurisCost10s: 160, estimatedTime: "~1min30",
    settings: [DURATION_5_10],
  },
  {
    id: "kling-v21-master-i2v", type: "video", brand: "Kling", name: "v2.1 Master (I2V)",
    endpoint: "kling/v2.1-master",
    description: "Image vers vidéo cinématique", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 60, caurisCost10s: 120, estimatedTime: "~1min",
    settings: [DURATION_5_10],
  },
  {
    id: "kling-o1-std-i2v", type: "video", brand: "Kling", name: "O1 Standard (I2V)",
    endpoint: "kling/o1-std",
    description: "Raisonnement avancé pour prompts complexes", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 50, caurisCost10s: 100, estimatedTime: "~45s",
    settings: [DURATION_5_10],
  },
  {
    id: "wan-26-t2v", type: "video", brand: "WAN", name: "v2.6 T2V",
    endpoint: "wan/v2.6-t2v",
    description: "Texte vers vidéo HD", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 45, caurisCost10s: 90, estimatedTime: "~1min",
    settings: [
      DURATION_5_10, VIDEO_SIZE_720,
    ],
  },
  {
    id: "wan-26-i2v", type: "video", brand: "WAN", name: "v2.6 I2V",
    endpoint: "wan/v2.6-i2v",
    description: "Image vers vidéo HD", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90, estimatedTime: "~1min",
    settings: [DURATION_5_10, VIDEO_SIZE_720],
  },
  {
    id: "wan-25-t2v", type: "video", brand: "WAN", name: "v2.5 T2V 1080p",
    endpoint: "wan/v2.5-t2v",
    description: "Texte vers vidéo Full HD", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 60, caurisCost10s: 120, estimatedTime: "~1min30",
    settings: [DURATION_5_10, { ...ASPECT_RATIO_STANDARD }],
  },
  {
    id: "seedance-pro-i2v", type: "video", brand: "Seedance", name: "Pro 1080p (I2V)",
    endpoint: "seedance/pro",
    description: "Image vers vidéo haute qualité", icon: "◫", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140, estimatedTime: "~1min30",
    settings: [DURATION_5_10],
  },
  {
    id: "minimax-hailuo-i2v", type: "video", brand: "MiniMax", name: "Hailuo 02 1080p",
    endpoint: "minimax/hailuo-02",
    description: "Vidéo fluide haute résolution", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 60, estimatedTime: "~1min",
    settings: [DURATION_5_10],
  },
  {
    id: "runway-gen4-turbo-i2v", type: "video", brand: "RunWay", name: "Gen4 Turbo (I2V)",
    endpoint: "runway/gen4-turbo",
    description: "Génération rapide et créative", icon: "□", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 80, estimatedTime: "~1min",
    settings: [DURATION_5_10],
  },

  // ════════════════════════════════════════
  //  AUDIO MODELS (Freepik)
  // ════════════════════════════════════════

  {
    id: "music-generation", type: "audio", brand: "Freepik", name: "Music Generation",
    endpoint: "freepik/music",
    description: "Musique IA depuis un prompt texte", icon: "♪", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 8, estimatedTime: "~15s", recommended: true,
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 5, max: 60, step: 5, defaultValue: 15 },
    ],
  },
  {
    id: "sound-effects", type: "audio", brand: "Freepik", name: "Sound Effects",
    endpoint: "freepik/sfx",
    description: "Bruitages réalistes depuis du texte", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 5, estimatedTime: "~10s",
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 1, max: 30, step: 1, defaultValue: 5 },
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
    if (duration >= 10 && model.caurisCost10s) cost = model.caurisCost10s;
    if (settings.size?.includes("1920") || settings.size?.includes("1080")) cost = Math.ceil(cost * 1.3);
    return cost;
  }

  if (model.type === "audio") {
    return cost;
  }

  // Image models
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
