import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string | null;
}

const VideoModal = ({ isOpen, onClose, videoId }: VideoModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleEsc);
        setIsFullscreen(false);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  if (!isOpen || !videoId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
        onClick={onClose}
      >
        <motion.div
          layout
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            width: isFullscreen ? "100vw" : "100%",
            height: isFullscreen ? "100vh" : "auto",
            maxWidth: isFullscreen ? "100vw" : "72rem",
            borderRadius: isFullscreen ? "0px" : "12px",
          }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-black overflow-hidden shadow-2xl shadow-lime/10 border border-lime/20 
            ${isFullscreen ? "fixed inset-0 z-[110] border-0" : "relative aspect-video w-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }}
              className="p-2 bg-black/50 hover:bg-lime text-white hover:text-black rounded-full transition-all duration-300 border border-white/10"
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-lime text-white hover:text-black rounded-full transition-all duration-300 border border-white/10 group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="w-full h-full">
            <iframe
              src={`https://app.videas.fr/embed/media/${videoId}/?title=false&logo=false&autoplay=1`}
              title="Video Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;
