import Hero from "@/components/pelikulart/Hero";
import QuoteManifesto from "@/components/pelikulart/QuoteManifesto";
import DemoProduct from "@/components/pelikulart/DemoProduct";
import ForWho from "@/components/pelikulart/ForWho";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import ProofSection from "@/components/pelikulart/ProofSection";
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
      <ScrollSection><ForWho /></ScrollSection>
      <ScrollSection><HowItWorks /></ScrollSection>
      <ScrollSection><ProofSection /></ScrollSection>
      <ScrollSection><LandingPricing /></ScrollSection>
      <ScrollSection><FAQ /></ScrollSection>
      <ScrollSection><FinalCTA /></ScrollSection>
    </div>
  );
};

export default HomePage;
