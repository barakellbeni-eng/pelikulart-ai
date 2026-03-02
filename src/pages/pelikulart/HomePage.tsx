import Hero from "@/components/pelikulart/Hero";

import SocialProof from "@/components/pelikulart/SocialProof";
import DemoProduct from "@/components/pelikulart/DemoProduct";


import TheSolution from "@/components/pelikulart/TheSolution";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import VideoGallery from "@/components/pelikulart/VideoGallery";

import LandingPricing from "@/components/pelikulart/LandingPricing";
import PaymentMarquee from "@/components/PaymentMarquee";

import FAQ from "@/components/pelikulart/FAQ";
import FinalCTA from "@/components/pelikulart/FinalCTA";
import ScrollSection from "@/components/pelikulart/ScrollSection";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden relative">
      <Hero />
      <SocialProof />
      <ScrollSection><DemoProduct /></ScrollSection>
      
      <ScrollSection><TheSolution /></ScrollSection>
      <ScrollSection><HowItWorks /></ScrollSection>
      <ScrollSection><VideoGallery /></ScrollSection>
      
      <ScrollSection><LandingPricing /></ScrollSection>
      <ScrollSection>
        <div className="py-10">
          <PaymentMarquee showAvailability showSignupCTA />
        </div>
      </ScrollSection>
      
      <ScrollSection><FAQ /></ScrollSection>
      <ScrollSection><FinalCTA /></ScrollSection>
    </div>
  );
};

export default HomePage;
