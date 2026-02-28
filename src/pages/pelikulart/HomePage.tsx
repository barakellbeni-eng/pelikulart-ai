import Hero from "@/components/pelikulart/Hero";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import PremiumServiceSelector from "@/components/pelikulart/PremiumServiceSelector";
import SecondaryVideoSection from "@/components/pelikulart/SecondaryVideoSection";
import Behanzin from "@/components/pelikulart/Behanzin";
import TrainingCTA from "@/components/pelikulart/TrainingCTA";
import FAQ from "@/components/pelikulart/FAQ";
import FloatingPromoBanner from "@/components/pelikulart/FloatingPromoBanner";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-black relative">
      <Hero />
      <VideoGallery />
      <PremiumServiceSelector />
      <SecondaryVideoSection />
      <Behanzin />
      <TrainingCTA />
      <FAQ />
      <FloatingPromoBanner />
    </div>
  );
};

export default HomePage;
