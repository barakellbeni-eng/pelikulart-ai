import PromotionalBanner from "@/components/landing/PromotionalBanner";
import TrainingCTA from "@/components/landing/TrainingCTA";
import TrainingOffers from "@/components/landing/TrainingOffers";
import TrainingFAQ from "@/components/landing/TrainingFAQ";
import PelikulartFooter from "@/components/landing/PelikulartFooter";
import Navigation from "@/components/landing/Navigation";

const Training = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-20">
        <PromotionalBanner />
        <TrainingCTA />
        <TrainingOffers />
        <TrainingFAQ />
      </div>

      <PelikulartFooter />
    </div>
  );
};

export default Training;
