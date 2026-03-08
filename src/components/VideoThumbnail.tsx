import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface VideoThumbnailProps {
  src: string;
  className?: string;
  aspectSquare?: boolean;
}

/**
 * Shows a thumbnail (first frame) with a play icon overlay.
 * First click reveals the player (paused). User clicks play to start.
 */
export default function VideoThumbnail({ src, className = "", aspectSquare = false }: VideoThumbnailProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract first frame as thumbnail
  useEffect(() => {
    if (!src) return;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";

    video.onloadeddata = () => {
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          setThumbnail(canvas.toDataURL("image/jpeg", 0.8));
        }
      } catch {
        // CORS issues — fallback to no thumbnail
      }
    };

    video.onerror = () => {
      // Can't load — no thumbnail
    };

    video.src = src;

    return () => {
      video.src = "";
      video.load();
    };
  }, [src]);

  if (showPlayer) {
    return (
      <video
        src={src}
        controls
        controlsList="nodownload"
        className={`w-full ${aspectSquare ? "aspect-square object-cover" : ""} ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div
      className={`relative w-full cursor-pointer group/video ${aspectSquare ? "aspect-square" : ""} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setShowPlayer(true);
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          className={`w-full ${aspectSquare ? "aspect-square object-cover" : "object-cover"}`}
        />
      ) : (
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          className={`w-full ${aspectSquare ? "aspect-square object-cover" : "object-cover"}`}
        />
      )}
      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-black/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover/video:scale-110 transition-transform">
          <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}
