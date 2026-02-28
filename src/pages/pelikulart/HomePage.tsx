import { Link } from "react-router-dom";
import Hero from "@/components/pelikulart/Hero";
import VideoGallery from "@/components/pelikulart/VideoGallery";
import TrainingCTA from "@/components/pelikulart/TrainingCTA";
import FAQ from "@/components/pelikulart/FAQ";
import PaymentMarquee from "@/components/PaymentMarquee";

const STUDIO_VIDEO_URL =
  "https://app.videas.fr/embed/media/2f752018-6649-465a-bac7-dcf94d9744ae/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=true&thumbnail=video";

const HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-black relative">
      <Hero />

      {/* Studio promo section */}
      <section className="relative w-full bg-black py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Créez des images & vidéos <span className="text-lime">avec l'IA</span>
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            Notre studio IA vous permet de générer des visuels époustouflants en quelques secondes. Essayez gratuitement.
          </p>
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={STUDIO_VIDEO_URL}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              referrerPolicy="unsafe-url"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40">
              <p className="text-white text-lg sm:text-2xl md:text-3xl font-bold mb-1 drop-shadow-xl tracking-tight">
                🎁 Inscription gratuite
              </p>
              <p className="text-lime text-2xl sm:text-4xl md:text-5xl font-black mb-6 drop-shadow-xl tracking-tight">
                Recevez 50 Cauris offerts !
              </p>
              <Link
                to="/auth"
                className="pointer-events-auto bg-lime text-black font-extrabold px-10 py-4 rounded-2xl text-base sm:text-lg md:text-xl hover:bg-lime/90 hover:scale-105 transition-all shadow-2xl"
              >
                Essayer le Studio gratuitement →
              </Link>
            </div>
          </div>
        </div>
      </section>

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
