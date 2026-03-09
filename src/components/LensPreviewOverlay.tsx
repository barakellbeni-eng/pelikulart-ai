import { motion } from "framer-motion";

interface LensPreviewOverlayProps {
  lensType: "prime" | "anamorphic" | "macro" | "special";
  focal: string;
  aperture: string;
  fov: number;
}

/**
 * Visual preview with black bars and zoom effects
 */
export default function LensPreviewOverlay({ lensType, focal, aperture, fov }: LensPreviewOverlayProps) {
  // Calculate zoom level based on focal length (50mm = 1x reference)
  const getZoomLevel = () => {
    if (lensType === "anamorphic") return 1;
    if (lensType === "special") {
      if (focal === "fisheye") return 0.7;
      if (focal === "tilt-shift") return 1;
      if (focal === "lensbaby") return 1.1;
    }
    const focalNum = parseInt(focal) || 50;
    return Math.max(0.6, Math.min(2, focalNum / 50));
  };

  // Calculate black bar sizes based on aspect ratio / lens type
  const getBars = () => {
    // Anamorphic: 2.39:1 cinematic
    if (lensType === "anamorphic") {
      return { top: "12%", bottom: "12%", left: "0%", right: "0%" };
    }
    // Fisheye: circular crop
    if (lensType === "special" && focal === "fisheye") {
      return { top: "8%", bottom: "8%", left: "8%", right: "8%" };
    }
    // Ultra wide: slight top/bottom bars
    if (fov >= 100) {
      return { top: "6%", bottom: "6%", left: "0%", right: "0%" };
    }
    // Wide: minimal bars
    if (fov >= 70) {
      return { top: "4%", bottom: "4%", left: "0%", right: "0%" };
    }
    // Telephoto: pillarbox effect (sides)
    if (fov <= 15) {
      return { top: "0%", bottom: "0%", left: "15%", right: "15%" };
    }
    if (fov <= 25) {
      return { top: "0%", bottom: "0%", left: "8%", right: "8%" };
    }
    // Normal: no bars
    return { top: "0%", bottom: "0%", left: "0%", right: "0%" };
  };

  const zoom = getZoomLevel();
  const bars = getBars();
  const hasTopBottomBars = bars.top !== "0%" || bars.bottom !== "0%";
  const hasSideBars = bars.left !== "0%" || bars.right !== "0%";

  // Get aperture indicator
  const getApertureLabel = () => {
    if (aperture === "auto") return "";
    return aperture;
  };

  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Zoom effect container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: zoom }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* This creates the zoom preview effect */}
        <div className="absolute inset-0 bg-transparent" />
      </motion.div>

      {/* Top black bar */}
      <motion.div
        className="absolute inset-x-0 top-0 bg-black"
        initial={{ height: "0%" }}
        animate={{ height: bars.top }}
        transition={{ duration: 0.3 }}
      />

      {/* Bottom black bar */}
      <motion.div
        className="absolute inset-x-0 bottom-0 bg-black"
        initial={{ height: "0%" }}
        animate={{ height: bars.bottom }}
        transition={{ duration: 0.3 }}
      />

      {/* Left black bar */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-black"
        initial={{ width: "0%" }}
        animate={{ width: bars.left }}
        transition={{ duration: 0.3 }}
      />

      {/* Right black bar */}
      <motion.div
        className="absolute inset-y-0 right-0 bg-black"
        initial={{ width: "0%" }}
        animate={{ width: bars.right }}
        transition={{ duration: 0.3 }}
      />

      {/* Fisheye circular mask */}
      {lensType === "special" && focal === "fisheye" && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              transparent 0%, 
              transparent 45%, 
              black 50%, 
              black 100%)`,
          }}
        />
      )}

      {/* Anamorphic horizontal flare hint */}
      {lensType === "anamorphic" && (
        <motion.div 
          className="absolute left-0 right-0 h-[1px]"
          style={{ top: "50%" }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            background: `linear-gradient(90deg, transparent 5%, hsl(var(--primary) / 0.3) 50%, transparent 95%)`
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Info badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {/* Zoom indicator */}
        {zoom !== 1 && (
          <motion.div 
            className="text-[10px] font-mono text-primary bg-background/90 px-2 py-1 rounded border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {zoom > 1 ? `ZOOM ${zoom.toFixed(1)}×` : `WIDE ${(1/zoom).toFixed(1)}×`}
          </motion.div>
        )}

        {/* Aspect ratio indicator */}
        {(hasTopBottomBars || hasSideBars) && (
          <motion.div 
            className="text-[10px] font-mono text-muted-foreground bg-background/90 px-2 py-1 rounded border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {lensType === "anamorphic" ? "2.39:1" : 
             hasSideBars ? "CROP" : 
             fov >= 100 ? "ULTRA WIDE" : "WIDE"}
          </motion.div>
        )}

        {/* Aperture */}
        {getApertureLabel() && (
          <motion.div 
            className="text-[10px] font-mono text-muted-foreground bg-background/90 px-2 py-1 rounded border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {getApertureLabel()}
          </motion.div>
        )}
      </div>

      {/* Center focus indicator for macro/shallow DOF */}
      {(lensType === "macro" || aperture === "f/1.4") && (
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-dashed border-primary/40 rounded-full"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}