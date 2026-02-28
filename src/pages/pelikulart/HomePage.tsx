import Hero from "@/components/pelikulart/Hero";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import TrainingCTA from "@/components/pelikulart/TrainingCTA";
import FAQ from "@/components/pelikulart/FAQ";
import PaymentMarquee from "@/components/PaymentMarquee";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-black relative">
      <Hero />
      <div className="py-10 bg-black">
        <PaymentMarquee showAvailability showSignupCTA />
      </div>
      <VideoGallery />
      <TrainingCTA />
      <FAQ />
    </div>
  );
};

export default HomePage;
