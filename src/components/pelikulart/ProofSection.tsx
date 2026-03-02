import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";
import heroVideo2 from "@/assets/hero-video-2.mp4";
import { useState, useRef, useEffect } from "react";

const videos = [heroVideo, heroVideo2];

const ProofSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-32 md:py-44 overflow-hidden">
      {/* Background video loop */}
      {videos.map((src, i) => (
        <video
          key={src}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms]"
          style={{
            opacity: i === currentVideo ? 1 : 0,
            transform: "scale(1.15)",
          }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Top & bottom gradient masks */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-white/30 font-mono mb-4"
        >
          Preuve
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display leading-tight max-w-3xl"
        >
          Découvre ce que Pelikulart a déjà rendu possible.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-10"
        >
          <Link
            to="/creations"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-display font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_40px_hsl(23_100%_50%/0.15)] hover:shadow-[0_0_60px_hsl(23_100%_50%/0.25)]"
          >
            <Play className="w-5 h-5 text-primary" />
            Voir nos créations
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProofSection;
