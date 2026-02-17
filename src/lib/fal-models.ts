// Fal AI Models Configuration
// Each model has its own endpoint and specific settings

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
  endpoint: string;
  description: string;
  icon: string; // emoji
  color: string; // gradient from-to
  type: ModelType;
  settings: ModelSetting[];
  supportsImageInput?: boolean;
  maxImages?: number;
}

export const FAL_MODELS: FalModel[] = [
  {
    id: "nano-banana-pro",
    type: "image",
    name: "Nano Banana Pro",
    endpoint: "fal-ai/nano-banana-pro",
    description: "Rapide et polyvalent, bon rapport qualité/vitesse",
    icon: "🍌",
    color: "from-yellow-500 to-orange-400",
    maxImages: 4,
    supportsImageInput: true,
    settings: [
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "4:5", label: "4:5" },
          { value: "5:4", label: "5:4" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
        ],
        defaultValue: "4:5",
      },
      {
        key: "resolution",
        label: "Résolution",
        type: "select",
        options: [
          { value: "1K", label: "1K" },
          { value: "2K", label: "2K" },
          { value: "4K", label: "4K" },
        ],
        defaultValue: "2K",
      },
    ],
  },
  {
    id: "flux-dev",
    type: "image",
    name: "FLUX.1 [dev]",
    endpoint: "fal-ai/flux/dev",
    description: "Haute qualité, meilleur rendu détaillé",
    icon: "⚡",
    color: "from-blue-500 to-cyan-400",
    maxImages: 4,
    supportsImageInput: false,
    settings: [
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "square_hd", label: "Carré HD" },
          { value: "square", label: "Carré" },
          { value: "portrait_4_3", label: "Portrait 4:3" },
          { value: "portrait_16_9", label: "Portrait 16:9" },
          { value: "landscape_4_3", label: "Paysage 4:3" },
          { value: "landscape_16_9", label: "Paysage 16:9" },
        ],
        defaultValue: "square_hd",
      },
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 28,
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 3.5,
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "flux-schnell",
    type: "image",
    name: "FLUX.1 [schnell]",
    endpoint: "fal-ai/flux/schnell",
    description: "Ultra rapide, 4 étapes seulement",
    icon: "🚀",
    color: "from-green-500 to-emerald-400",
    maxImages: 4,
    supportsImageInput: false,
    settings: [
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "square_hd", label: "Carré HD" },
          { value: "square", label: "Carré" },
          { value: "portrait_4_3", label: "Portrait 4:3" },
          { value: "portrait_16_9", label: "Portrait 16:9" },
          { value: "landscape_4_3", label: "Paysage 4:3" },
          { value: "landscape_16_9", label: "Paysage 16:9" },
        ],
        defaultValue: "square_hd",
      },
      {
        key: "num_inference_steps",
        label: "Étapes",
        type: "slider",
        min: 1,
        max: 12,
        step: 1,
        defaultValue: 4,
      },
    ],
  },
  {
    id: "flux-pro-ultra",
    type: "image",
    name: "FLUX Pro v1.1 Ultra",
    endpoint: "fal-ai/flux-pro/v1.1-ultra",
    description: "Pro 2K, qualité maximale",
    icon: "💎",
    color: "from-purple-500 to-pink-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "21:9", label: "21:9" },
        ],
        defaultValue: "1:1",
      },
      {
        key: "raw",
        label: "Mode Raw (moins stylisé)",
        type: "toggle",
        defaultValue: false,
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "flux-kontext",
    type: "image",
    name: "FLUX Kontext [pro]",
    endpoint: "fal-ai/flux-pro/kontext",
    description: "Édition contextuelle avec image de référence",
    icon: "🎨",
    color: "from-orange-500 to-red-400",
    maxImages: 1,
    supportsImageInput: true,
    settings: [
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 28,
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 3.5,
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "recraft-v3",
    type: "image",
    name: "Recraft V3",
    endpoint: "fal-ai/recraft/v3",
    description: "SOTA en génération, styles variés, texte dans l'image",
    icon: "🖌️",
    color: "from-rose-500 to-fuchsia-400",
    maxImages: 2,
    supportsImageInput: false,
    settings: [
      {
        key: "style",
        label: "Style",
        type: "select",
        options: [
          { value: "realistic_image", label: "Réaliste" },
          { value: "digital_illustration", label: "Illustration digitale" },
          { value: "vector_illustration", label: "Illustration vectorielle" },
          { value: "icon", label: "Icône" },
        ],
        defaultValue: "realistic_image",
      },
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "1024x1024", label: "1024×1024" },
          { value: "1365x1024", label: "1365×1024" },
          { value: "1024x1365", label: "1024×1365" },
          { value: "1536x1024", label: "1536×1024" },
          { value: "1024x1536", label: "1024×1536" },
        ],
        defaultValue: "1024x1024",
      },
    ],
  },
  {
    id: "ideogram-v2",
    type: "image",
    name: "Ideogram V2",
    endpoint: "fal-ai/ideogram/v2",
    description: "Excellent pour le texte dans les images",
    icon: "✍️",
    color: "from-indigo-500 to-blue-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "4:3", label: "4:3" },
          { value: "3:4", label: "3:4" },
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "3:2", label: "3:2" },
          { value: "2:3", label: "2:3" },
        ],
        defaultValue: "1:1",
      },
      {
        key: "style_type",
        label: "Type de style",
        type: "select",
        options: [
          { value: "auto", label: "Auto" },
          { value: "general", label: "Général" },
          { value: "realistic", label: "Réaliste" },
          { value: "design", label: "Design" },
          { value: "render_3d", label: "Rendu 3D" },
          { value: "anime", label: "Anime" },
        ],
        defaultValue: "auto",
      },
      {
        key: "negative_prompt",
        label: "Prompt négatif",
        type: "text",
        defaultValue: "",
        description: "Ce que vous ne voulez PAS dans l'image",
      },
    ],
  },
  {
    id: "imagen4",
    type: "image",
    name: "Google Imagen 4",
    endpoint: "fal-ai/imagen4/preview",
    description: "Modèle Google, images hyper-détaillées",
    icon: "🔮",
    color: "from-sky-500 to-blue-400",
    maxImages: 4,
    supportsImageInput: false,
    settings: [
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "1:1", label: "1:1" },
          { value: "3:4", label: "3:4" },
          { value: "4:3", label: "4:3" },
          { value: "9:16", label: "9:16" },
          { value: "16:9", label: "16:9" },
        ],
        defaultValue: "1:1",
      },
    ],
  },
  {
    id: "fast-sdxl",
    type: "image",
    name: "Fast SDXL",
    endpoint: "fal-ai/fast-sdxl",
    description: "Stable Diffusion XL rapide, très personnalisable",
    icon: "🎯",
    color: "from-amber-500 to-yellow-400",
    maxImages: 4,
    supportsImageInput: false,
    settings: [
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "square_hd", label: "Carré HD" },
          { value: "square", label: "Carré" },
          { value: "portrait_4_3", label: "Portrait 4:3" },
          { value: "portrait_16_9", label: "Portrait 16:9" },
          { value: "landscape_4_3", label: "Paysage 4:3" },
          { value: "landscape_16_9", label: "Paysage 16:9" },
        ],
        defaultValue: "square_hd",
      },
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 25,
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 7.5,
      },
      {
        key: "negative_prompt",
        label: "Prompt négatif",
        type: "text",
        defaultValue: "",
        description: "Ce que vous ne voulez PAS",
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "hidream-i1",
    type: "image",
    name: "HiDream I1 Full",
    endpoint: "fal-ai/hidream-i1-full",
    description: "Modèle open-source haute qualité",
    icon: "🌈",
    color: "from-teal-500 to-cyan-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "square_hd", label: "Carré HD" },
          { value: "square", label: "Carré" },
          { value: "portrait_4_3", label: "Portrait 4:3" },
          { value: "portrait_16_9", label: "Portrait 16:9" },
          { value: "landscape_4_3", label: "Paysage 4:3" },
          { value: "landscape_16_9", label: "Paysage 16:9" },
        ],
        defaultValue: "square_hd",
      },
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 28,
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 15,
        step: 0.5,
        defaultValue: 5,
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
  {
    id: "flux2-dev",
    type: "image",
    name: "FLUX.2 [dev]",
    endpoint: "fal-ai/flux2/dev",
    description: "Dernière génération FLUX, édition avancée",
    icon: "⚡",
    color: "from-violet-500 to-purple-400",
    maxImages: 1,
    supportsImageInput: true,
    settings: [
      {
        key: "image_size",
        label: "Taille",
        type: "select",
        options: [
          { value: "square_hd", label: "Carré HD" },
          { value: "square", label: "Carré" },
          { value: "portrait_4_3", label: "Portrait 4:3" },
          { value: "portrait_16_9", label: "Portrait 16:9" },
          { value: "landscape_4_3", label: "Paysage 4:3" },
          { value: "landscape_16_9", label: "Paysage 16:9" },
        ],
        defaultValue: "square_hd",
      },
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 28,
      },
      {
        key: "guidance_scale",
        label: "Guidance Scale",
        type: "slider",
        min: 1,
        max: 20,
        step: 0.5,
        defaultValue: 3.5,
      },
    ],
  },
  // ===== VIDEO MODELS =====
  {
    id: "veo3",
    type: "video",
    name: "Google Veo 3",
    endpoint: "fal-ai/veo3",
    description: "Google, vidéo haute qualité avec audio",
    icon: "🎬",
    color: "from-red-500 to-rose-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "duration",
        label: "Durée (secondes)",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "8", label: "8s" },
        ],
        defaultValue: "8",
      },
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        defaultValue: "16:9",
      },
      {
        key: "include_audio",
        label: "Inclure l'audio",
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
  {
    id: "minimax-video",
    type: "video",
    name: "MiniMax Video",
    endpoint: "fal-ai/minimax/video-01-live",
    description: "Vidéo fluide et expressive",
    icon: "🎥",
    color: "from-cyan-500 to-teal-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "prompt_optimizer",
        label: "Optimiser le prompt",
        type: "toggle",
        defaultValue: true,
      },
    ],
  },
  {
    id: "kling-video",
    type: "video",
    name: "Kling 1.6",
    endpoint: "fal-ai/kling-video/v1.6/standard/text-to-video",
    description: "Vidéos réalistes, mouvements naturels",
    icon: "🎞️",
    color: "from-emerald-500 to-green-400",
    maxImages: 1,
    supportsImageInput: false,
    settings: [
      {
        key: "duration",
        label: "Durée",
        type: "select",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
        ],
        defaultValue: "5",
      },
      {
        key: "aspect_ratio",
        label: "Ratio",
        type: "select",
        options: [
          { value: "16:9", label: "16:9" },
          { value: "9:16", label: "9:16" },
          { value: "1:1", label: "1:1" },
        ],
        defaultValue: "16:9",
      },
    ],
  },
  {
    id: "framepack-f1",
    type: "video",
    name: "Framepack F1",
    endpoint: "fal-ai/framepack/f1",
    description: "Image vers vidéo, animation réaliste",
    icon: "🖼️",
    color: "from-fuchsia-500 to-pink-400",
    maxImages: 1,
    supportsImageInput: true,
    settings: [
      {
        key: "num_inference_steps",
        label: "Étapes d'inférence",
        type: "slider",
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 25,
      },
      {
        key: "seed",
        label: "Seed (0 = aléatoire)",
        type: "slider",
        min: 0,
        max: 9999999,
        step: 1,
        defaultValue: 0,
      },
    ],
  },
];

export function getModelById(id: string): FalModel | undefined {
  return FAL_MODELS.find((m) => m.id === id);
}

export function getDefaultSettings(model: FalModel): Record<string, any> {
  const defaults: Record<string, any> = {};
  model.settings.forEach((s) => {
    defaults[s.key] = s.defaultValue;
  });
  return defaults;
}

export function getModelsByType(type: ModelType): FalModel[] {
  return FAL_MODELS.filter((m) => m.type === type);
}
