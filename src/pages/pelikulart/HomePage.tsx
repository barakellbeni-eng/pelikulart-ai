import Hero from "@/components/pelikulart/Hero";
import SocialProof from "@/components/pelikulart/SocialProof";
import TheProblem from "@/components/pelikulart/TheProblem";
import TheSolution from "@/components/pelikulart/TheSolution";
import HowItWorks from "@/components/pelikulart/HowItWorks";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import ForWho from "@/components/pelikulart/ForWho";
import LandingPricing from "@/components/pelikulart/LandingPricing";
import PaymentMarquee from "@/components/PaymentMarquee";
import Testimonials from "@/components/pelikulart/Testimonials";
import FAQ from "@/components/pelikulart/FAQ";
import FinalCTA from "@/components/pelikulart/FinalCTA";
import ScrollSection from "@/components/pelikulart/ScrollSection";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-black relative">
      {/* 1. HERO */}
      <Hero />

      {/* 2. SOCIAL PROOF */}
      <SocialProof />

      {/* 3. THE PROBLEM */}
      <ScrollSection>
        <TheProblem />
      </ScrollSection>

      {/* 4. THE SOLUTION */}
      <ScrollSection>
        <TheSolution />
      </ScrollSection>

      {/* 5. HOW IT WORKS */}
      <ScrollSection>
        <HowItWorks />
      </ScrollSection>

      {/* 6. GALERIE / DÉMO */}
      <ScrollSection>
        <VideoGallery />
      </ScrollSection>

      {/* 7. FOR WHO */}
      <ScrollSection>
        <ForWho />
      </ScrollSection>

      {/* 8. PRICING */}
      <ScrollSection>
        <LandingPricing />
      </ScrollSection>

      {/* Payment Methods */}
      <ScrollSection>
        <div className="py-10 bg-black">
          <PaymentMarquee showAvailability showSignupCTA />
        </div>
      </ScrollSection>

      {/* 9. TESTIMONIALS */}
      <ScrollSection>
        <Testimonials />
      </ScrollSection>

      {/* 10. FAQ */}
      <ScrollSection>
        <FAQ />
      </ScrollSection>

      {/* 11. CTA FINAL */}
      <ScrollSection>
        <FinalCTA />
      </ScrollSection>

      {/* 12. FOOTER is handled by the layout */}
    </div>
  );
};

export default HomePage;
