import Hero from "@/components/pelikulart/Hero";
import QuoteManifesto from "@/components/pelikulart/QuoteManifesto";
import DemoProduct from "@/components/pelikulart/DemoProduct";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import GalleryShowcase from "@/components/pelikulart/GalleryShowcase";
import LandingPricing from "@/components/pelikulart/LandingPricing";
import FAQ from "@/components/pelikulart/FAQ";
import FinalCTA from "@/components/pelikulart/FinalCTA";
import ScrollSection from "@/components/pelikulart/ScrollSection";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden relative">
      <Hero />
      <ScrollSection><QuoteManifesto /></ScrollSection>
      <ScrollSection><DemoProduct /></ScrollSection>
      <ScrollSection><HowItWorks /></ScrollSection>
      <ScrollSection><GalleryShowcase /></ScrollSection>
      <ScrollSection><LandingPricing /></ScrollSection>
      <ScrollSection><FAQ /></ScrollSection>
      <ScrollSection><FinalCTA /></ScrollSection>
    </div>
  );
};

export default HomePage;
