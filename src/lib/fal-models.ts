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
  provider?: ModelProvider;
  kieModel?: string;
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

const ASPECT_RATIO_IMAGEN4: ModelSetting = {
  key: "aspect_ratio", label: "Ratio", type: "select",
  options: [
    { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
    { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
  ],
  defaultValue: "1:1",
};

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

const RESOLUTION_SETTING: ModelSetting = {
  key: "resolution", label: "Résolution", type: "select",
  options: [
    { value: "1K", label: "1K" }, { value: "2K", label: "2K" }, { value: "4K", label: "4K" },
  ],
  defaultValue: "1K",
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
//  ALL MODELS
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
    maxImages: 4, supportsImageInput: true, maxInputImages: 1, caurisCost: 1, estimatedTime: "~3s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      { ...RESOLUTION_SETTING, defaultValue: "2K" },
    ],
  },

  // ── Google Nano Banana (KIE) ──
  {
    id: "kie-nano-banana", type: "image", brand: "Google", name: "Nano Banana",
    endpoint: "kie", provider: "kie", kieModel: "google/nano-banana",
    description: "T2I ou Edit auto selon image uploadée", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 10, caurisCost: 1, estimatedTime: "~5s",
    settings: [
      { ...ASPECT_RATIO_NANO_BANANA, key: "image_size" },
      RESOLUTION_SETTING,
    ],
  },
  {
    id: "kie-nano-banana-pro", type: "image", brand: "Google", name: "Nano Banana Pro",
    endpoint: "kie", provider: "kie", kieModel: "nano-banana-pro",
    description: "T2I ou I2I auto selon image uploadée", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 8, caurisCost: 1, estimatedTime: "~5s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      RESOLUTION_SETTING,
    ],
  },
  {
    id: "kie-nano-banana-2", type: "image", brand: "Google", name: "Nano Banana 2",
    endpoint: "kie", provider: "kie", kieModel: "nano-banana-2",
    description: "T2I ou I2I auto + Google Search", icon: "★", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 14, caurisCost: 1, estimatedTime: "~5s", recommended: true,
    settings: [
      ASPECT_RATIO_NANO_BANANA,
      RESOLUTION_SETTING,
      { key: "google_search", label: "Google Search (infos temps réel)", type: "toggle", defaultValue: false },
    ],
  },

  // ── Google Imagen 4 (KIE) ──
  {
    id: "kie-imagen4", type: "image", brand: "Google", name: "Imagen 4",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4",
    description: "Images hyper-détaillées par Google", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 3, estimatedTime: "~10s", recommended: true,
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "kie-imagen4-fast", type: "image", brand: "Google", name: "Imagen 4 Fast",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4-fast",
    description: "Version rapide, meilleur rapport qualité/prix", icon: "▹", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 2, estimatedTime: "~5s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },
  {
    id: "kie-imagen4-ultra", type: "image", brand: "Google", name: "Imagen 4 Ultra",
    endpoint: "kie", provider: "kie", kieModel: "google/imagen4-ultra",
    description: "Qualité maximale, détails extrêmes", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: false, caurisCost: 4, estimatedTime: "~15s",
    settings: [ASPECT_RATIO_IMAGEN4],
  },

  // ── Flux 2 Pro (KIE) ──
  {
    id: "kie-flux2-pro", type: "image", brand: "FLUX", name: "Flux 2 Pro",
    endpoint: "kie", provider: "kie", kieModel: "flux-2/pro-text-to-image",
    description: "T2I ou I2I auto selon image uploadée", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 8, caurisCost: 3, estimatedTime: "~12s", recommended: true,
    settings: [ASPECT_RATIO_FLUX_PRO],
  },

  // ── Seedream 4.5 (KIE) ──
  {
    id: "kie-seedream-v45", type: "image", brand: "Seedream", name: "Seedream 4.5",
    endpoint: "kie", provider: "kie", kieModel: "seedream/4.5-text-to-image",
    description: "T2I ou Edit auto, ultra réaliste", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 5, caurisCost: 2, estimatedTime: "~5s", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "1:1", label: "1:1 — Carré" }, { value: "16:9", label: "16:9 — Cinématique" }, { value: "9:16", label: "9:16 — Vertical" },
        { value: "4:3", label: "4:3 — Photo classique" }, { value: "3:4", label: "3:4 — Portrait" },
        { value: "3:2", label: "3:2 — Paysage photo" }, { value: "2:3", label: "2:3 — Portrait long" },
      ], defaultValue: "1:1" },
    ],
  },

  // ── Seedream 5.0 Lite (KIE) ──
  {
    id: "kie-seedream-v50-lite", type: "image", brand: "Seedream", name: "Seedream 5.0 Lite",
    endpoint: "kie", provider: "kie", kieModel: "seedream/5.0-lite-text-to-image",
    description: "Rapide et léger, bon rapport qualité/prix", icon: "▸", color: "from-white/20 to-white/5",
    maxImages: 4, supportsImageInput: true, maxInputImages: 5, caurisCost: 1, estimatedTime: "~3s",
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
    maxImages: 1, supportsImageInput: true, caurisCost: 14, caurisCost10s: 28, estimatedTime: "~2min", recommended: true,
    settings: [
      DURATION_5_10,
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
      { key: "multi_shots", label: "Multi-Shot", type: "toggle", defaultValue: false },
      { key: "sound", label: "Effets sonores", type: "toggle", defaultValue: false },
    ],
  },

  // ── Kling 2.6 (KIE) ──
  {
    id: "kie-kling-26", type: "video", brand: "Kling", name: "Kling 2.6",
    endpoint: "kie", provider: "kie", kieModel: "kling-2.6/text-to-video",
    description: "T2V ou I2V auto, audio natif", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 8, caurisCost10s: 16, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
      { key: "sound", label: "Effets sonores", type: "toggle", defaultValue: false },
    ],
  },

  // ── Kling 2.6 Motion Control (KIE) ──
  {
    id: "kie-kling-26-motion", type: "video", brand: "Kling", name: "Kling 2.6 Motion Control",
    endpoint: "kie", provider: "kie", kieModel: "kling-2.6/motion-control",
    description: "Contrôle de mouvement précis, T2V ou I2V", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 4, caurisCost10s: 8, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p" }, { value: "1080p", label: "1080p" },
      ], defaultValue: "720p" },
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9" }, { value: "9:16", label: "9:16" }, { value: "1:1", label: "1:1" },
      ], defaultValue: "16:9" },
    ],
  },

  // ── Kling 2.5 Turbo (KIE) ──
  {
    id: "kie-kling-25-turbo", type: "video", brand: "Kling", name: "Kling 2.5 Turbo",
    endpoint: "kie", provider: "kie", kieModel: "kling/v2-5-turbo-text-to-video-pro",
    description: "T2V ou I2V auto, rapide et fluide", icon: "▸", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 6, caurisCost10s: 12, estimatedTime: "~45s",
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
    description: "T2V ou I2V auto, Standard / Pro / Master", icon: "◇", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 4, caurisCost10s: 8, estimatedTime: "~1min",
    settings: [
      DURATION_5_10,
      { key: "mode", label: "Mode", type: "select", options: [
        { value: "std", label: "Standard" }, { value: "pro", label: "Pro" }, { value: "master", label: "Master" },
      ], defaultValue: "std" },
    ],
  },

  // ── Kling Avatar Lip Sync (KIE) ──
  {
    id: "kie-kling-avatar", type: "video", brand: "Kling", name: "Kling Avatar Lip Sync",
    endpoint: "kie", provider: "kie", kieModel: "kling/avatar-lip-sync",
    description: "Lip sync réaliste sur avatar, nécessite une image", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 17, estimatedTime: "~2min",
    settings: [
      { key: "resolution", label: "Résolution", type: "select", options: [
        { value: "720p", label: "720p Standard" }, { value: "1080p", label: "1080p Pro" },
      ], defaultValue: "720p" },
    ],
  },

  // ── Veo 3.1 (KIE) ──
  {
    id: "kie-veo31", type: "video", brand: "Google", name: "Veo 3.1",
    endpoint: "kie", provider: "kie", kieModel: "veo3",
    description: "Vidéo cinématique avec audio synchronisé, T2V ou I2V", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 2, supportsImageInput: true, caurisCost: 36, estimatedTime: "~2min", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9 — Paysage" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "16:9" },
    ],
  },
  {
    id: "kie-veo31-fast", type: "video", brand: "Google", name: "Veo 3.1 Fast",
    endpoint: "kie", provider: "kie", kieModel: "veo3_fast",
    description: "Génération rapide, bon rapport qualité/prix", icon: "▸", color: "from-white/20 to-white/5",
    maxImages: 2, supportsImageInput: true, caurisCost: 9, estimatedTime: "~1min",
    settings: [
      { key: "aspect_ratio", label: "Ratio", type: "select", options: [
        { value: "16:9", label: "16:9 — Paysage" }, { value: "9:16", label: "9:16 — Vertical" },
      ], defaultValue: "16:9" },
    ],
  },

  // ── Sora 2 (KIE) ──
  {
    id: "kie-sora2", type: "video", brand: "Sora", name: "Sora 2",
    endpoint: "kie", provider: "kie", kieModel: "sora-2-text-to-video",
    description: "T2V ou I2V auto, physique réaliste, rapide", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 5, caurisCost15s: 6, estimatedTime: "~1min", recommended: true,
    settings: [
      { key: "aspect_ratio", label: "Format", type: "select", options: [
        { value: "landscape", label: "Paysage (16:9)" }, { value: "portrait", label: "Portrait (9:16)" },
      ], defaultValue: "landscape" },
      { key: "n_frames", label: "Durée", type: "select", options: [
        { value: "10", label: "~10s (Standard)" }, { value: "15", label: "~15s (Stable)" },
      ], defaultValue: "10" },
    ],
  },
  {
    id: "kie-sora2-pro", type: "video", brand: "Sora", name: "Sora 2 Pro",
    endpoint: "kie", provider: "kie", kieModel: "sora-2-pro-text-to-video",
    description: "Qualité maximale, T2V ou I2V auto", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 22, estimatedTime: "~2min",
    settings: [
      { key: "aspect_ratio", label: "Format", type: "select", options: [
        { value: "landscape", label: "Paysage (16:9)" }, { value: "portrait", label: "Portrait (9:16)" },
      ], defaultValue: "landscape" },
      { key: "n_frames", label: "Durée", type: "select", options: [
        { value: "10", label: "~10s" }, { value: "15", label: "~15s" },
      ], defaultValue: "10" },
      { key: "sora_mode", label: "Qualité", type: "select", options: [
        { value: "standard", label: "Standard" }, { value: "high", label: "High" }, { value: "storyboard", label: "Storyboard" },
      ], defaultValue: "standard" },
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

  // ── ElevenLabs ──
  {
    id: "kie-elevenlabs-sfx", type: "audio", brand: "ElevenLabs", name: "Sound Effects v2",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/sound-effect-v2",
    description: "Effets sonores via ElevenLabs", icon: "◆", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 1, estimatedTime: "~10s",
    settings: [
      { key: "duration", label: "Durée (secondes)", type: "slider", min: 1, max: 22, step: 1, defaultValue: 5 },
    ],
  },
  {
    id: "kie-elevenlabs-isolation", type: "audio", brand: "ElevenLabs", name: "Audio Isolation",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/audio-isolation",
    description: "Isoler la voix ou la musique d'un fichier audio", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 1, estimatedTime: "~15s",
    settings: [],
  },
  {
    id: "kie-elevenlabs-stt", type: "audio", brand: "ElevenLabs", name: "Speech to Text",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/speech-to-text",
    description: "Transcrire un fichier audio en texte", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: true, caurisCost: 1, estimatedTime: "~10s",
    settings: [],
  },
  {
    id: "kie-elevenlabs-tts-turbo", type: "audio", brand: "ElevenLabs", name: "TTS Turbo 2.5",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/text-to-speech-turbo-v2.5",
    description: "Text-to-Speech ultra-rapide", icon: "▸", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 2, estimatedTime: "~3s",
    settings: [],
  },
  {
    id: "kie-elevenlabs-tts", type: "audio", brand: "ElevenLabs", name: "TTS Multilingual v2",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/text-to-speech-multilingual-v2",
    description: "Text-to-Speech multilingue haute qualité", icon: "○", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 3, estimatedTime: "~5s",
    settings: [],
  },
  {
    id: "kie-elevenlabs-dialogue", type: "audio", brand: "ElevenLabs", name: "V3 Text to Dialogue",
    endpoint: "kie", provider: "kie", kieModel: "elevenlabs/v3-text-to-dialogue",
    description: "Dialogue multi-voix réaliste", icon: "◈", color: "from-white/20 to-white/5",
    maxImages: 1, supportsImageInput: false, caurisCost: 3, estimatedTime: "~10s",
    settings: [],
  },

  // ── Suno ──
  {
    id: "kie-suno-lyrics", type: "audio", brand: "Suno", name: "Generate Lyrics",
    endpoint: "kie", provider: "kie", kieModel: "suno/generate-lyrics",
    description: "Générer des paroles à partir d'un thème", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: false, caurisCost: 1, estimatedTime: "~5s",
    settings: [
      { key: "style", label: "Style musical", type: "text", defaultValue: "", description: "Ex: Pop, Rock, Jazz, Afrobeat..." },
    ],
  },
  {
    id: "kie-suno-boost", type: "audio", brand: "Suno", name: "Boost Style",
    endpoint: "kie", provider: "kie", kieModel: "suno/boost-style",
    description: "Améliorer le style d'un morceau existant", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 1, estimatedTime: "~15s",
    settings: [],
  },
  {
    id: "kie-suno-music-video", type: "audio", brand: "Suno", name: "Create Music Video",
    endpoint: "kie", provider: "kie", kieModel: "suno/create-music-video",
    description: "Créer un clip vidéo à partir d'une musique", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 1, estimatedTime: "~30s",
    settings: [],
  },
  {
    id: "kie-suno-replace", type: "audio", brand: "Suno", name: "Replace Section",
    endpoint: "kie", provider: "kie", kieModel: "suno/replace-section",
    description: "Remplacer une section d'un morceau", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 2, estimatedTime: "~20s",
    settings: [],
  },
  {
    id: "kie-suno-mashup", type: "audio", brand: "Suno", name: "Mashup",
    endpoint: "kie", provider: "kie", kieModel: "suno/mashup",
    description: "Fusionner deux morceaux en un mashup", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 3, estimatedTime: "~30s",
    settings: [],
  },
  {
    id: "kie-suno-cover", type: "audio", brand: "Suno", name: "Upload & Cover Audio",
    endpoint: "kie", provider: "kie", kieModel: "suno/upload-cover-audio",
    description: "Créer une cover à partir d'un audio uploadé", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 3, estimatedTime: "~30s",
    settings: [],
  },
  {
    id: "kie-suno-extend", type: "audio", brand: "Suno", name: "Upload & Extend Audio",
    endpoint: "kie", provider: "kie", kieModel: "suno/upload-extend-audio",
    description: "Prolonger un morceau audio uploadé", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 3, estimatedTime: "~30s",
    settings: [],
  },
  {
    id: "kie-suno-vocal-sep", type: "audio", brand: "Suno", name: "Vocal Separation",
    endpoint: "kie", provider: "kie", kieModel: "suno/vocal-separation",
    description: "Séparer les voix de la musique", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 3, estimatedTime: "~20s",
    settings: [],
  },
  {
    id: "kie-suno-multistem", type: "audio", brand: "Suno", name: "Multi-Stem Separation",
    endpoint: "kie", provider: "kie", kieModel: "suno/multi-stem-separation",
    description: "Séparer en stems individuels (voix, batterie, basse, etc.)", icon: "♫", color: "from-amber-500/20 to-orange-500/10",
    maxImages: 1, supportsImageInput: true, caurisCost: 10, estimatedTime: "~30s",
    settings: [],
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
  const cost = _getModelCost(model, settings);
  return model.type === "image" ? cost * numImages : cost;
}

function _getModelCost(model: FalModel, settings: Record<string, any>): number {
  const id = model.id;
  const duration = settings.duration ? parseInt(settings.duration) : 5;
  const resolution = settings.resolution || "";
  const hasAudio = settings.sound === true || settings.generate_audio === true || settings.include_audio === true;
  const mode = settings.mode || "std";

  // ════ IMAGE ════
  if (model.type === "image") {
    // Resolution-based Nano Banana models: 1K=1, 2K=2, 4K=3
    if (["pelikulart-nano-banana", "kie-nano-banana", "kie-nano-banana-pro", "kie-nano-banana-2"].includes(id)) {
      if (resolution === "4K") return 3;
      if (resolution === "2K") return 2;
      return 1;
    }
    // All other image models: flat cost
    return model.caurisCost;
  }

  // ════ VIDEO ════
  if (model.type === "video") {
    // Kling V2.1 — mode-based pricing
    if (id === "kie-kling-21") {
      const costs: Record<string, Record<string, number>> = {
        std: { "5": 4, "10": 8 },
        pro: { "5": 8, "10": 15 },
        master: { "5": 23, "10": 46 },
      };
      return costs[mode]?.[String(duration)] ?? 4;
    }

    // Kling 2.5 Turbo
    if (id === "kie-kling-25-turbo") {
      return duration >= 10 ? 12 : 6;
    }

    // Kling 2.6
    if (id === "kie-kling-26") {
      const base = duration >= 10 ? 16 : 8;
      return hasAudio ? base * 2 : base;
    }

    // Kling 2.6 Motion Control
    if (id === "kie-kling-26-motion") {
      if (resolution === "1080p") return duration >= 10 ? 13 : 6;
      return duration >= 10 ? 8 : 4; // 720p default
    }

    // Kling 3.0 — resolution × duration × audio
    if (id === "kie-kling-30") {
      const table: Record<string, Record<string, Record<string, number>>> = {
        "720p":  { "5": { off: 14, on: 21 }, "10": { off: 28, on: 42 } },
        "1080p": { "5": { off: 19, on: 28 }, "10": { off: 38, on: 57 } },
      };
      const res = resolution === "1080p" ? "1080p" : "720p";
      const dur = duration >= 10 ? "10" : "5";
      const audio = hasAudio ? "on" : "off";
      return table[res]?.[dur]?.[audio] ?? 14;
    }

    // Kling Avatar Lip Sync
    if (id === "kie-kling-avatar") {
      return resolution === "1080p" ? 34 : 17;
    }

    // Veo 3.1 — flat costs
    if (id === "kie-veo31") return 36;
    if (id === "kie-veo31-fast") return 9;

    // Sora 2
    if (id === "kie-sora2") {
      const nFrames = parseInt(settings.n_frames || "10");
      return nFrames >= 15 ? 6 : 5;
    }

    // Sora 2 Pro — mode × duration
    if (id === "kie-sora2-pro") {
      const nFrames = parseInt(settings.n_frames || "10");
      const soraMode = settings.sora_mode || "standard";
      if (soraMode === "high") return nFrames >= 15 ? 90 : 47;
      // standard & storyboard have same pricing
      return nFrames >= 15 ? 38 : 22;
    }

    // Seedance fallback
    if (id === "kie-seedance-15-pro") {
      let cost = duration >= 10 ? (model.caurisCost10s || model.caurisCost * 2) : model.caurisCost;
      if (resolution === "1080p") cost = Math.ceil(cost * 1.3);
      if (hasAudio) cost = Math.ceil(cost * 1.2);
      return cost;
    }

    // Generic video fallback
    if (duration >= 10 && model.caurisCost10s) return model.caurisCost10s;
    return model.caurisCost;
  }

  // ════ AUDIO ════
  return model.caurisCost;
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
