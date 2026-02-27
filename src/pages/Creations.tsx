import Navigation from "@/components/landing/Navigation";
import VideoGallery from "@/components/landing/VideoGallery";
import PelikulartFooter from "@/components/landing/PelikulartFooter";

const Creations = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-20">
        <VideoGallery />
      </div>
      <PelikulartFooter />
    </div>
  );
};

export default Creations;
