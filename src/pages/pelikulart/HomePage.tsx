import Hero from "@/components/pelikulart/Hero";
import ProblemLine from "@/components/pelikulart/ProblemLine";
import DemoProduct from "@/components/pelikulart/DemoProduct";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import MediaTicker from "@/components/pelikulart/MediaTicker";
import LandingPricing from "@/components/pelikulart/LandingPricing";
import FAQ from "@/components/pelikulart/FAQ";
import FinalCTA from "@/components/pelikulart/FinalCTA";
import ScrollSection from "@/components/pelikulart/ScrollSection";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden relative">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Le problème en 1 ligne */}
      <ScrollSection><ProblemLine /></ScrollSection>

      {/* 3. La solution — Demo produit */}
      <ScrollSection><DemoProduct /></ScrollSection>

      {/* 4. Comment ça marche */}
      <ScrollSection><HowItWorks /></ScrollSection>

      {/* 5. Ce que tu peux créer — ticker */}
      <ScrollSection><MediaTicker /></ScrollSection>

      {/* 6. Pricing */}
      <ScrollSection><LandingPricing /></ScrollSection>

      {/* 7. FAQ */}
      <ScrollSection><FAQ /></ScrollSection>

      {/* 8. CTA Final */}
      <ScrollSection><FinalCTA /></ScrollSection>
    </div>
  );
};

export default HomePage;
