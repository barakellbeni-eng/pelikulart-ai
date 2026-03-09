import { motion } from "framer-motion";

interface LensPreviewOverlayProps {
  lensType: "prime" | "anamorphic" | "macro" | "special";
  focal: string;
  aperture: string;
  fov: number;
}

/**
 * Simulates lens effects as CSS overlays for preview
 * - Depth of field (blur based on aperture)
 * - Vignette (based on lens type)
 * - Distortion (for wide/fisheye)
 * - Anamorphic flares
 * - Tilt-shift selective focus
 */
export default function LensPreviewOverlay({ lensType, focal, aperture, fov }: LensPreviewOverlayProps) {
  // Calculate blur intensity based on aperture
  const getBlurIntensity = () => {
    switch (aperture) {
      case "f/1.4": return 12;
      case "f/2.8": return 6;
      case "f/8": return 0;
      default: return 4; // auto
    }
  };

  // Calculate vignette intensity based on focal length
  const getVignetteIntensity = () => {
    if (lensType === "macro") return 0.7;
    if (lensType === "special" && focal === "fisheye") return 0.8;
    if (fov >= 100) return 0.5; // ultra wide
    if (fov >= 70) return 0.3; // wide
    if (fov <= 25) return 0.4; // telephoto
    return 0.2; // normal
  };

  // Calculate focus area size (smaller = more bokeh visible)
  const getFocusSize = () => {
    if (lensType === "macro") return 25;
    switch (aperture) {
      case "f/1.4": return 35;
      case "f/2.8": return 50;
      case "f/8": return 100;
      default: return 45;
    }
  };

  const blurIntensity = getBlurIntensity();
  const vignetteIntensity = getVignetteIntensity();
  const focusSize = getFocusSize();

  // Fisheye barrel distortion simulation
  if (lensType === "special" && focal === "fisheye") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Barrel distortion effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              transparent 0%, 
              transparent 40%, 
              rgba(0,0,0,0.3) 70%, 
              rgba(0,0,0,0.8) 100%)`,
          }}
        />
        {/* Edge blur */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blurIntensity * 0.5}px)`,
            mask: `radial-gradient(circle at 50% 50%, transparent 50%, black 100%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent 50%, black 100%)`,
          }}
        />
        {/* 180° FOV indicator */}
        <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-full" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 bg-background/80 px-2 py-0.5 rounded">
          180° FISHEYE
        </div>
      </div>
    );
  }

  // Tilt-shift miniature effect
  if (lensType === "special" && focal === "tilt-shift") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Top blur zone */}
        <div 
          className="absolute inset-x-0 top-0 h-[35%]"
          style={{
            backdropFilter: `blur(${blurIntensity}px)`,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 100%)`,
          }}
        />
        {/* Bottom blur zone */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[35%]"
          style={{
            backdropFilter: `blur(${blurIntensity}px)`,
            background: `linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 100%)`,
          }}
        />
        {/* Focus band indicator */}
        <div 
          className="absolute inset-x-0 top-[35%] h-[30%] border-y border-dashed border-primary/30"
        />
        {/* Guide lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <line x1="0" y1="35%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary" />
          <line x1="0" y1="65%" x2="100%" y2="65%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-primary" />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-primary/60 bg-background/80 px-2 py-0.5 rounded">
          TILT-SHIFT
        </div>
      </div>
    );
  }

  // Lensbaby swirl/selective focus
  if (lensType === "special" && focal === "lensbaby") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Off-center focus spot */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blurIntensity}px)`,
            mask: `radial-gradient(ellipse 30% 35% at 35% 40%, transparent 0%, black 70%)`,
            WebkitMask: `radial-gradient(ellipse 30% 35% at 35% 40%, transparent 0%, black 70%)`,
          }}
        />
        {/* Swirl vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 90% at 35% 40%, 
              transparent 0%, 
              rgba(0,0,0,0.3) 50%, 
              rgba(0,0,0,0.5) 100%)`,
          }}
        />
        {/* Focus point indicator */}
        <div className="absolute top-[35%] left-[30%] w-8 h-8 border-2 border-dashed border-primary/40 rounded-full" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 bg-background/80 px-2 py-0.5 rounded">
          LENSBABY
        </div>
      </div>
    );
  }

  // Anamorphic lens effects
  if (lensType === "anamorphic") {
    const squeezeMultiplier = focal === "2x" ? 2 : focal === "1.5x" ? 1.5 : 1.33;
    const flareOpacity = focal === "2x" ? 0.25 : focal === "1.5x" ? 0.18 : 0.12;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* 2.39:1 aspect letterbox */}
        <div className="absolute inset-x-0 top-0 h-[12%] bg-black/90" />
        <div className="absolute inset-x-0 bottom-0 h-[12%] bg-black/90" />
        
        {/* Horizontal lens flare */}
        <motion.div 
          className="absolute top-1/2 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(100,180,255,${flareOpacity}) 20%,
              rgba(100,180,255,${flareOpacity * 1.5}) 50%,
              rgba(100,180,255,${flareOpacity}) 80%,
              transparent 100%)`,
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scaleX: [0.95, 1.02, 0.95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Secondary flare streaks */}
        <div 
          className="absolute top-[45%] left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 10%, rgba(180,100,255,${flareOpacity * 0.5}) 50%, transparent 90%)`,
          }}
        />
        <div 
          className="absolute top-[55%] left-0 right-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent 15%, rgba(255,180,100,${flareOpacity * 0.5}) 50%, transparent 85%)`,
          }}
        />
        
        {/* Edge softness / oval bokeh vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse ${100 / squeezeMultiplier}% 100% at 50% 50%, 
              transparent 40%, 
              rgba(0,0,0,0.15) 70%, 
              rgba(0,0,0,0.35) 100%)`,
          }}
        />
        
        {/* Squeeze indicator */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 bg-background/80 px-2 py-0.5 rounded flex items-center gap-2">
          <span>ANAMORPHIC {focal}</span>
          <span className="opacity-60">2.39:1</span>
        </div>
      </div>
    );
  }

  // Macro extreme shallow DOF
  if (lensType === "macro") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
        {/* Extreme radial blur */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blurIntensity * 1.5}px)`,
            mask: `radial-gradient(circle at 50% 50%, transparent ${focusSize * 0.6}%, black ${focusSize * 1.2}%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent ${focusSize * 0.6}%, black ${focusSize * 1.2}%)`,
          }}
        />
        {/* Strong vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              transparent 20%, 
              rgba(0,0,0,${vignetteIntensity * 0.5}) 60%, 
              rgba(0,0,0,${vignetteIntensity}) 100%)`,
          }}
        />
        {/* Focus ring indicator */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-primary/30 rounded-full"
          style={{ width: `${focusSize * 1.5}%`, height: `${focusSize * 1.5}%` }}
        />
        {/* 1:1 indicator for 100mm */}
        {focal === "100" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary/60 bg-background/80 px-2 py-0.5 rounded">
            MACRO 1:1
          </div>
        )}
      </div>
    );
  }

  // Standard prime lenses (depth of field + vignette)
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {/* Depth of field blur (edges) */}
      {blurIntensity > 0 && (
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blurIntensity}px)`,
            mask: `radial-gradient(circle at 50% 50%, transparent ${focusSize}%, black ${focusSize + 30}%)`,
            WebkitMask: `radial-gradient(circle at 50% 50%, transparent ${focusSize}%, black ${focusSize + 30}%)`,
          }}
        />
      )}
      
      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            transparent 50%, 
            rgba(0,0,0,${vignetteIntensity * 0.5}) 80%, 
            rgba(0,0,0,${vignetteIntensity}) 100%)`,
        }}
      />
      
      {/* Wide angle distortion indicator for 14mm/24mm */}
      {fov >= 70 && (
        <>
          {/* Grid lines showing barrel distortion */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <path d="M 0,50% Q 25%,48% 50%,50% Q 75%,52% 100%,50%" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
            <path d="M 50%,0 Q 48%,25% 50%,50% Q 52%,75% 50%,100%" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground" />
          </svg>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/60 bg-background/80 px-2 py-0.5 rounded">
            {fov}° WIDE
          </div>
        </>
      )}
      
      {/* Telephoto compression indicator */}
      {fov <= 25 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/60 bg-background/80 px-2 py-0.5 rounded">
          {fov}° TELEPHOTO
        </div>
      )}
      
      {/* Focus area indicator */}
      {aperture === "f/1.4" && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-primary/20 rounded-full"
          style={{ width: `${focusSize * 2}%`, height: `${focusSize * 2}%` }}
        />
      )}
    </div>
  );
}
