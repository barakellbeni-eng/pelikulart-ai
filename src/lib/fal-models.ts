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
export type ModelProvider = "fal" | "google-direct" | "kie";

export interface FalModel {
  id: string;
  name: string;
  brand: string;
  endpoint: string;
  provider?: ModelProvider; // defaults to "fal" if not set; "google-direct" for Pelikulart; "kie" for KIE AI
  kieModel?: string; // KIE AI model identifier (e.g. "google/nano-banana")
  description: string;
  icon: string;
  color: string;
  type: ModelType;
  settings: ModelSetting[];
  supportsImageInput?: boolean;
  maxInputImages?: number;
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
    id: "pelikulart-nano-banana", type: "image", brand: "Pelikulart", name: "Pelikulart Nano Banana",
    endpoint: "google-direct", provider: "google-direct",
    description: "Gemini Flash Image — API maison, rapide", icon: "★", color: "from-primary/30 to-primary/10",
    maxImages: 4, supportsImageInput: true, maxInputImages: 1, caurisCost: 2, estimatedTime: "~3s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "2K" },
    ],
  },

  // ── Google Nano Banana (KIE) ──
  {
    id: "kie-nano-banana", type: "image", brand: "Google", name: "Nano Banana",
    endpoint: "kie", provider: "kie", kieModel: "google/nano-banana",
    description: "T2I ou Edit auto selon image uploadée", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 10, caurisCost: 2, estimatedTime: "~5s",
    settings: [
      { ...ASPECT_RATIO_NANO_BANANA, key: "image_size" },
    ],
  },
  {
    id: "kie-nano-banana-pro", type: "image", brand: "Google", name: "Nano Banana Pro",
    endpoint: "kie", provider: "kie", kieModel: "nano-banana-pro",
    description: "T2I ou I2I auto selon image uploadée", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 8, caurisCost: 3, estimatedTime: "~5s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "1K" },
    ],
  },
  {
    id: "kie-nano-banana-2", type: "image", brand: "Google", name: "Nano Banana 2",
    endpoint: "kie", provider: "kie", kieModel: "nano-banana-2",
    description: "T2I ou I2I auto + Google Search", icon: "★", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 14, caurisCost: 3, estimatedTime: "~5s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
      ], defaultValue: "1K" },
      { key: "google_search", label: "Google Search (infos temps réel)", type: "toggle", defaultValue: false },
    ],
  },

  // ── Google Imagen 4 (KIE) ──
  {
    id: "kie-imagen4", type: "image", brand: "Google", name: "Imagen 4",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4",
    description: "Images hyper-détaillées par Google", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 8, estimatedTime: "~10s", recommended: true,
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "kie-imagen4-fast", type: "image", brand: "Google", name: "Imagen 4 Fast",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4-fast",
    description: "Version rapide, meilleur rapport qualité/prix", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 6, estimatedTime: "~5s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "kie-imagen4-ultra", type: "image", brand: "Google", name: "Imagen 4 Ultra",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4-ultra",
    description: "Qualité maximale, détails extrêmes", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 10, estimatedTime: "~15s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },

  // ── Flux 2 Pro (KIE) ──
  {
    id: "kie-flux2-pro", type: "image", brand: "FLUX", name: "Flux 2 Pro",
    endpoint: "kie", provider: "kie", kieModel: "flux-2/pro-text-to-image",
    description: "T2I ou I2I auto selon image uploadée", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 8, caurisCost: 8, estimatedTime: "~12s", recommended: true,
    settings: [ASPECT_RATIO_FLUX_PRO],
  },

  // ── Z-Image Turbo (KIE) ──
  {
    id: "kie-zimage-turbo", type: "image", brand: "Z-Image", name: "Z-Image Turbo",
    endpoint: "kie", provider: "kie", kieModel: "z-image-turbo",
    description: "Ultra rapide, photoréaliste, très économique", icon: "⚡", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 1, estimatedTime: "~3s",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
        { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
      ], defaultValue: "1:1" },
    ],
  },

  // ── Seedream 4.5 (KIE) ──
  {
    id: "kie-seedream-v45", type: "image", brand: "Seedream", name: "Seedream 4.5",
    endpoint: "kie", provider: "kie", kieModel: "seedream/4.5-text-to-image",
    description: "T2I ou Edit auto, ultra réaliste", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 5, caurisCost: 6, estimatedTime: "~5s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
        { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
      ], defaultValue: "1:1" },
    ],
  },

  // ════════════════════════════════════════
  //  VIDEO MODELS
  // ════════════════════════════════════════

  // ── Kling 3.0 (KIE) ──
  {
    id: "kie-kling-30", type: "video", brand: "Kling", name: "Kling 3.0",
    endpoint: "kie", provider: "kie", kieModel: "kling-3.0/video",
    description: "Multi-shot & elements, T2V ou I2V auto", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 60, caurisCost10s: 120, estimatedTime: "~2min", recommended: true,
    settings: [
      { key: "duration", label: "Durée", type: "select", options: [
        { value: "5", label: "5s" }, { value: "10", label: "10s" },
      ], defaultValue: "5" },
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
      { key: "mode", label: "Mode", type: "select", options: [
        { value: "std", label: "Standard" }, { value: "pro", label: "Pro" },
      ], defaultValue: "std" },
      { key: "sound", label: "Effets sonores", type: "toggle", defaultValue: false },
    ],
  },

  // ── Kling 2.6 (KIE) ──
  {
    id: "kie-kling-26", type: "video", brand: "Kling", name: "Kling 2.6",
    endpoint: "kie", provider: "kie", kieModel: "kling-2.6/text-to-video",
    description: "T2V ou I2V auto, audio natif", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 40, caurisCost10s: 80, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
      { key: "sound", label: "Effets sonores", type: "toggle", defaultValue: false },
    ],
  },

  // ── Kling 2.5 Turbo (KIE) ──
  {
    id: "kie-kling-25-turbo", type: "video", brand: "Kling", name: "Kling 2.5 Turbo",
    endpoint: "kie", provider: "kie", kieModel: "kling/v2-5-turbo-text-to-video-pro",
    description: "T2V ou I2V auto, rapide et fluide", icon: "▸", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 30, caurisCost10s: 60, estimatedTime: "~45s",
    settings: [
      DURATION_5_10,
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
    ],
  },

  // ── Kling V2.1 (KIE) ──
  {
    id: "kie-kling-21", type: "video", brand: "Kling", name: "Kling V2.1",
    endpoint: "kie", provider: "kie", kieModel: "kling/v2-1-master-text-to-video",
    description: "T2V ou I2V auto, qualité Master", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 25, caurisCost10s: 50, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
    ],
  },

  // ── Wan 2.6 (KIE) ──
  {
    id: "kie-wan-26", type: "video", brand: "Wan", name: "Wan 2.6",
    endpoint: "kie", provider: "kie", kieModel: "wan/2-6-text-to-video",
    description: "T2V ou I2V auto, jusqu'à 1080p", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 45, caurisCost10s: 90, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
    ],
  },

  // ── Seedance 1.5 Pro (KIE) ──
  {
    id: "kie-seedance-15-pro", type: "video", brand: "Seedance", name: "Seedance 1.5 Pro",
    endpoint: "kie", provider: "kie", kieModel: "bytedance/seedance-1.5-pro",
    description: "T2V ou I2V auto + audio optionnel", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 70, caurisCost10s: 140, estimatedTime: "~1min30",
    settings: [
      DURATION_5_10,
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1" }, { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" },
        { value: "4:3", label: "4:3" }, { value: "3:4", label: "3:4" }, { value: "21:9", label: "21:9" },
      ], defaultValue: "16:9" },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "480p", label: "480p" }, { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
      { key: "generate_audio", label: "Générer l'audio", type: "toggle", defaultValue: false },
    ],
  },

  // ════════════════════════════════════════
  //  AUDIO MODELS
  // ════════════════════════════════════════

  {
    id: "kie-elevenlabs-sfx", type: "audio", brand: "ElevenLabs", name: "Sound Effects v2",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/sound-effect-v2",
    description: "Effets sonores via ElevenLabs", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 6, estimatedTime: "~10s",
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 1, max: 22, step: 1, defaultValue: 5 },
    ],
  },
  {
    id: "kie-elevenlabs-tts", type: "audio", brand: "ElevenLabs", name: "TTS Multilingual",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/text-to-speech-multilingual-v2",
    description: "Text-to-Speech multilingue", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 4, estimatedTime: "~5s",
    settings: [],
  },

  // ── Suno Music (via KIE AI) ──
  {
    id: "kie-suno-v5", type: "audio", brand: "Suno", name: "Suno V5",
    endpoint: "kie", provider: "kie", kieModel: "suno/v5",
    description: "Musique IA de pointe — expression musicale supérieure, génération rapide, jusqu'à 8 min",
    icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: false, caurisCost: 9, estimatedTime: "~2-4 min",
    recommended: true,
    settings: [
      { key: "audio_type", label: "Type", type: "select", options: [
        { value: "music", label: "🎵 Musique" }, { value: "instrumental", label: "🎹 Instrumental" },
      ], defaultValue: "music" },
      { key: "style", label: "Style musical", type: "text", defaultValue: "", description: "Ex: Pop, Rock, Jazz, Afrobeat, Lo-fi..." },
      { key: "title", label: "Titre du morceau", type: "text", defaultValue: "", description: "Titre optionnel (max 80 car.)" },
    ],
  },
  {
    id: "kie-suno-v4-5plus", type: "audio", brand: "Suno", name: "Suno V4.5+",
    endpoint: "kie", provider: "kie", kieModel: "suno/v4_5plus",
    description: "Son riche, nouvelles façons de créer, jusqu'à 8 min",
    icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: false, caurisCost: 7, estimatedTime: "~2-4 min",
    settings: [
      { key: "audio_type", label: "Type", type: "select", options: [
        { value: "music", label: "🎵 Musique" }, { value: "instrumental", label: "🎹 Instrumental" },
      ], defaultValue: "music" },
      { key: "style", label: "Style musical", type: "text", defaultValue: "", description: "Ex: Pop, Rock, Jazz, Afrobeat, Lo-fi..." },
      { key: "title", label: "Titre du morceau", type: "text", defaultValue: "", description: "Titre optionnel (max 80 car.)" },
    ],
  },
  {
    id: "kie-suno-v4", type: "audio", brand: "Suno", name: "Suno V4",
    endpoint: "kie", provider: "kie", kieModel: "suno/v4",
    description: "Qualité vocale améliorée, jusqu'à 4 min",
    icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: false, caurisCost: 5, estimatedTime: "~2-3 min",
    settings: [
      { key: "audio_type", label: "Type", type: "select", options: [
        { value: "music", label: "🎵 Musique" }, { value: "instrumental", label: "🎹 Instrumental" },
      ], defaultValue: "music" },
      { key: "style", label: "Style musical", type: "text", defaultValue: "", description: "Ex: Pop, Rock, Jazz, Afrobeat, Lo-fi..." },
      { key: "title", label: "Titre du morceau", type: "text", defaultValue: "", description: "Titre optionnel (max 80 car.)" },
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
