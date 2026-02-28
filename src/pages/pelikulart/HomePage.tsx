import Hero from "@/components/pelikulart/Hero";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import TrainingCTA from "@/components/pelikulart/TrainingCTA";
import FAQ from "@/components/pelikulart/FAQ";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-black relative">
      <Hero />
      <VideoGallery />
      <TrainingCTA />
      <FAQ />
    </div>
  );
};

export default HomePage;
