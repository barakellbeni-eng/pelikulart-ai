import Hero from "@/components/pelikulart/Hero";
import MediaTicker from "@/components/pelikulart/MediaTicker";
import SocialProof from "@/components/pelikulart/SocialProof";

import TheProblem from "@/components/pelikulart/TheProblem";
import TheSolution from "@/components/pelikulart/TheSolution";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import ForWho from "@/components/pelikulart/ForWho";
import LandingPricing from "@/components/pelikulart/LandingPricing";
import PaymentMarquee from "@/components/PaymentMarquee";

import FAQ from "@/components/pelikulart/FAQ";
import FinalCTA from "@/components/pelikulart/FinalCTA";
import ScrollSection from "@/components/pelikulart/ScrollSection";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden relative" style={{ backgroundColor: "#0A0A0A" }}>
      <Hero />
      <MediaTicker />
      <SocialProof />
      <ScrollSection><TheProblem /></ScrollSection>
      <ScrollSection><TheSolution /></ScrollSection>
      <ScrollSection><HowItWorks /></ScrollSection>
      <ScrollSection><VideoGallery /></ScrollSection>
      <ScrollSection><ForWho /></ScrollSection>
      <ScrollSection><LandingPricing /></ScrollSection>
      <ScrollSection>
        <div className="py-10" style={{ backgroundColor: "#0A0A0A" }}>
          <PaymentMarquee showAvailability showSignupCTA />
        </div>
      </ScrollSection>
      
      <ScrollSection><FAQ /></ScrollSection>
      <ScrollSection><FinalCTA /></ScrollSection>
    </div>
  );
};

export default HomePage;
