import logoGoogle from "@/assets/logo-google.png";
import logoFlux from "@/assets/logo-flux.png";
import logoSeedream from "@/assets/logo-seedream.png";
import logoPelikulart from "@/assets/pelikulart-logo.png";
import logoKling30 from "@/assets/logo-kling-30.png";
import logoKling26 from "@/assets/logo-kling-26.png";
import logoKling25 from "@/assets/logo-kling-25.png";
import logoKling21 from "@/assets/logo-kling-21.png";
import logoSuno from "@/assets/logo-suno.png";
import logoElevenLabs from "@/assets/logo-elevenlabs.png";
import logoIdeogram from "@/assets/logo-ideogram.png";
import logoSora from "@/assets/logo-sora.png";

const brandLogos: Record<string, string> = {
  Google: logoGoogle,
  FLUX: logoFlux,
  Seedream: logoSeedream,
  Pelikulart: logoPelikulart,
  Kling: logoKling30,
  Suno: logoSuno,
  ElevenLabs: logoElevenLabs,
  Ideogram: logoIdeogram,
  Seedance: logoSeedream,
  Sora: logoSora,
};

// Per-model logos (for brands with version-specific icons like Kling)
const modelLogos: Record<string, string> = {
  "kie-kling-30": logoKling30,
  "kie-kling-26": logoKling26,
  "kie-kling-25-turbo": logoKling25,
  "kie-kling-21": logoKling21,
};

export function getBrandLogo(brand: string, modelId?: string): string | null {
  if (modelId && modelLogos[modelId]) return modelLogos[modelId];
  return brandLogos[brand] ?? null;
}
