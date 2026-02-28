import logoGoogle from "@/assets/logo-google.png";
import logoFlux from "@/assets/logo-flux.png";
import logoSeedream from "@/assets/logo-seedream.png";
import logoIdeogram from "@/assets/logo-ideogram.png";
import logoPelikulart from "@/assets/pelikulart-logo.jpeg";

const brandLogos: Record<string, string> = {
  Google: logoGoogle,
  FLUX: logoFlux,
  Seedream: logoSeedream,
  Ideogram: logoIdeogram,
  Pelikulart: logoPelikulart,
};

export function getBrandLogo(brand: string): string | null {
  return brandLogos[brand] ?? null;
}
