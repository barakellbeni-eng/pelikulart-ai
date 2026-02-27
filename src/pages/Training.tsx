import PromotionalBanner from "@/components/landing/PromotionalBanner";
import TrainingCTA from "@/components/landing/TrainingCTA";
import TrainingOffers from "@/components/landing/TrainingOffers";
import TrainingFAQ from "@/components/landing/TrainingFAQ";
import PelikulartFooter from "@/components/landing/PelikulartFooter";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import pelikulartLogo from "@/assets/pelikulart-logo.jpeg";

const Training = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={pelikulartLogo} alt="Pelikulart AI" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold tracking-[0.15em] uppercase text-white">
              PELIKULART<span className="text-primary">.</span>AI
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      <div className="pt-14">
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
