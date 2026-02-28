import logoGoogle from "@/assets/logo-google.png";
import logoFlux from "@/assets/logo-flux.png";
import logoSeedream from "@/assets/logo-seedream.png";
import logoPelikulart from "@/assets/pelikulart-logo.jpeg";
import logoKling30 from "@/assets/logo-kling-30.png";
import logoKling26 from "@/assets/logo-kling-26.png";
import logoKling25 from "@/assets/logo-kling-25.png";
import logoKling21 from "@/assets/logo-kling-21.png";
import logoKling21Master from "@/assets/logo-kling-21-master.png";
import logoKling16 from "@/assets/logo-kling-16.png";
import logoKling15 from "@/assets/logo-kling-15.png";

const brandLogos: Record<string, string> = {
  Google: logoGoogle,
  FLUX: logoFlux,
  Seedream: logoSeedream,
  Pelikulart: logoPelikulart,
};

// Per-model logos (for brands with version-specific icons like Kling)
const modelLogos: Record<string, string> = {
  "kling-v3-std-t2v": logoKling30,
  "kling-v3-pro-t2v": logoKling30,
  "kling-v25-turbo-i2v": logoKling25,
  "kling-v21-std-i2v": logoKling21,
  "kling-v2-master-t2v": logoKling21Master,
  "kling-v16-std-t2v": logoKling16,
  "kling-v16-elements": logoKling16,
};

export function getBrandLogo(brand: string, modelId?: string): string | null {
  if (modelId && modelLogos[modelId]) return modelLogos[modelId];
  return brandLogos[brand] ?? null;
}
