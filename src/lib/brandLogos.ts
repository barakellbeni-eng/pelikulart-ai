import logoGoogle from "@/assets/logo-google.png";
import logoFlux from "@/assets/logo-flux.png";
import logoSeedream from "@/assets/logo-seedream.png";
import logoPelikulart from "@/assets/pelikulart-logo.png";
import logoKling30 from "@/assets/logo-kling-30.png";
import logoKling26 from "@/assets/logo-kling-26.png";

const brandLogos: Record<string, string> = {
  Google: logoGoogle,
  FLUX: logoFlux,
  Seedream: logoSeedream,
  Pelikulart: logoPelikulart,
};

// Per-model logos (for brands with version-specific icons like Kling)
const modelLogos: Record<string, string> = {
  "kie-kling-30": logoKling30,
  "kie-kling-26": logoKling26,
};

export function getBrandLogo(brand: string, modelId?: string): string | null {
  if (modelId && modelLogos[modelId]) return modelLogos[modelId];
  return brandLogos[brand] ?? null;
}
