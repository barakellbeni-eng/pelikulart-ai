// Lens SVG Icons — Style D
// Each icon is 48x48 with viewBox 0 0 56 56

export const Lens14mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g14" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#2a2a2a" />
        <stop offset="100%" stopColor="#0a0a0a" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="27" fill="url(#g14)" stroke="#222" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="22" fill="#080808" stroke="#1e1e1e" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="17" fill="#060606" stroke="#1a1a1a" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="11" fill="#040404" stroke="#161616" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="6" fill="#1a2010" stroke="#252515" strokeWidth="0.8" />
    <ellipse cx="22" cy="21" rx="5" ry="2.5" fill="rgba(255,255,255,0.07)" transform="rotate(-30 22 21)" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity="0.4" />
  </svg>
);

export const Lens24mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g24" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#242424" />
        <stop offset="100%" stopColor="#0c0c0c" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="23" fill="url(#g24)" stroke="#222" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="18" fill="#070707" stroke="#1c1c1c" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="13" fill="#050505" stroke="#181818" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="8" fill="#12120a" stroke="#201e10" strokeWidth="0.8" />
    <ellipse cx="22" cy="21" rx="4" ry="2" fill="rgba(255,255,255,0.06)" transform="rotate(-30 22 21)" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity="0.35" />
  </svg>
);

export const Lens35mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g35" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#202020" />
        <stop offset="100%" stopColor="#0a0a0a" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="20" fill="url(#g35)" stroke="#1e1e1e" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="15" fill="#060606" stroke="#1a1a1a" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="10" fill="#040404" stroke="#161616" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="6" fill="#0e0e08" stroke="#1a1a10" strokeWidth="0.8" />
    <ellipse cx="23" cy="22" rx="3" ry="1.5" fill="rgba(255,255,255,0.06)" transform="rotate(-30 23 22)" />
    <circle cx="28" cy="28" r="1.2" fill="#ccff00" opacity="0.35" />
  </svg>
);

export const Lens50mm = ({ className, active }: { className?: string; active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g50a" cx="40%" cy="30%">
        <stop offset="0%" stopColor={active ? "#1a2800" : "#202020"} />
        <stop offset="100%" stopColor={active ? "#0a0f00" : "#0a0a0a"} />
      </radialGradient>
      <radialGradient id="g50g" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#ccff00" stopOpacity={active ? 0.18 : 0.05} />
        <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="17" fill="url(#g50a)" stroke={active ? "rgba(204,255,0,0.22)" : "#1e1e1e"} strokeWidth="0.8" />
    <circle cx="28" cy="28" r="12" fill={active ? "#050800" : "#060606"} stroke={active ? "rgba(204,255,0,0.12)" : "#1a1a1a"} strokeWidth="0.8" />
    <circle cx="28" cy="28" r="7" fill={active ? "#030500" : "#040404"} stroke={active ? "rgba(204,255,0,0.1)" : "#161616"} strokeWidth="0.8" />
    <circle cx="28" cy="28" r="7" fill="url(#g50g)" />
    <ellipse cx="23" cy="22" rx="3" ry="1.3" fill={active ? "rgba(204,255,0,0.09)" : "rgba(255,255,255,0.06)"} transform="rotate(-30 23 22)" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity={active ? 0.9 : 0.35} />
  </svg>
);

export const Lens85mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g85" cx="40%" cy="30%">
        <stop offset="0%" stopColor="#1f1510" />
        <stop offset="100%" stopColor="#0a0806" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="13" fill="url(#g85)" stroke="#1a1a1a" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="9" fill="#070705" stroke="#161614" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="6" fill="#0a0806" stroke="#181410" strokeWidth="0.8" />
    <ellipse cx="24" cy="23" rx="2.5" ry="1.1" fill="rgba(255,255,255,0.06)" transform="rotate(-30 24 23)" />
    <circle cx="28" cy="28" r="1" fill="#ccff00" opacity="0.3" />
  </svg>
);

export const Lens135mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="g135" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#100810" />
        <stop offset="100%" stopColor="#050305" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="8" fill="#131013" stroke="#1a1a1a" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="6" fill="#080608" stroke="#141414" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="4" fill="url(#g135)" stroke="#141018" strokeWidth="0.8" />
    <ellipse cx="26" cy="25" rx="2" ry="1" fill="rgba(255,255,255,0.05)" transform="rotate(-30 26 25)" />
    <circle cx="28" cy="28" r="1" fill="#ccff00" opacity="0.3" />
  </svg>
);

export const LensAnamorphic133 = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="ga1" cx="35%" cy="40%">
        <stop offset="0%" stopColor="#10100f" />
        <stop offset="100%" stopColor="#050508" />
      </radialGradient>
    </defs>
    <rect x="5" y="19" width="46" height="18" rx="5" fill="#0d0d0f" stroke="#1c1c1e" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="18" ry="10" fill="#060608" stroke="#1a1a1a" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="12" ry="6" fill="#040406" stroke="#141416" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="6" ry="3.5" fill="url(#ga1)" stroke="#101018" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="1.5" ry="0.9" fill="#ccff00" opacity="0.5" />
    <ellipse cx="19" cy="23" rx="4" ry="1.8" fill="rgba(255,255,255,0.05)" transform="rotate(-8 19 23)" />
  </svg>
);

export const LensAnamorphic15 = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="ga15" cx="35%" cy="40%">
        <stop offset="0%" stopColor="#101014" />
        <stop offset="100%" stopColor="#050509" />
      </radialGradient>
    </defs>
    <rect x="3" y="17" width="50" height="22" rx="5" fill="#0c0c10" stroke="#1c1c22" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="21" ry="12" fill="#060608" stroke="#1a1a1c" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="14" ry="7" fill="#040406" stroke="#141416" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="7" ry="4" fill="url(#ga15)" stroke="#0e0e16" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="2" ry="1" fill="#ccff00" opacity="0.55" />
    <ellipse cx="18" cy="22" rx="5" ry="2" fill="rgba(255,255,255,0.05)" transform="rotate(-8 18 22)" />
  </svg>
);

export const LensAnamorphic2x = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="ga3" cx="35%" cy="40%">
        <stop offset="0%" stopColor="#12101a" />
        <stop offset="100%" stopColor="#06040a" />
      </radialGradient>
    </defs>
    <rect x="0" y="15" width="56" height="26" rx="5" fill="#0c0c12" stroke="#1c1c28" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="26" ry="14" fill="#060608" stroke="#181820" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="17" ry="8" fill="#040406" stroke="#141418" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="9" ry="4.5" fill="url(#ga3)" stroke="#0c0c14" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="2.5" ry="1.2" fill="#ccff00" opacity="0.6" />
    <line x1="0" y1="28" x2="56" y2="28" stroke="#4488ff" strokeWidth="1" opacity="0.1" />
  </svg>
);

export const LensMacro60mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="gm6" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#101818" />
        <stop offset="100%" stopColor="#040a0a" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="20" fill="none" stroke="#1c1c1c" strokeWidth="2" />
    <circle cx="28" cy="28" r="16" fill="#0a0a0a" stroke="#161616" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="11" fill="#080808" stroke="#141414" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="7" fill="#060606" stroke="#121212" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="4" fill="url(#gm6)" stroke="#182020" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="1.2" fill="#ccff00" opacity="0.5" />
  </svg>
);

export const LensMacro100mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="gm10" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#101818" />
        <stop offset="100%" stopColor="#040a0a" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="23" fill="none" stroke="#1c1c1c" strokeWidth="2" />
    <circle cx="28" cy="28" r="19" fill="#0a0a0a" stroke="#161616" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="14" fill="#080808" stroke="#141414" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="9" fill="#060606" stroke="#121212" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="5" fill="url(#gm10)" stroke="#182020" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity="0.6" />
  </svg>
);

export const LensMacro180mm = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="gm18" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#101818" />
        <stop offset="100%" stopColor="#040a0a" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="26" fill="none" stroke="#1c1c1c" strokeWidth="2" />
    <circle cx="28" cy="28" r="22" fill="#0a0a0a" stroke="#161616" strokeWidth="0.5" />
    <circle cx="28" cy="28" r="17" fill="#080808" stroke="#141414" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="11" fill="#060606" stroke="#121212" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="6" fill="url(#gm18)" stroke="#182020" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="1.8" fill="#ccff00" opacity="0.6" />
  </svg>
);

export const LensFisheye = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="gfish" cx="38%" cy="28%">
        <stop offset="0%" stopColor="#1c1c2a" />
        <stop offset="60%" stopColor="#07070f" />
        <stop offset="100%" stopColor="#0d0d18" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="26" fill="#111115" stroke="#20202a" strokeWidth="0.8" />
    <circle cx="28" cy="26" r="21" fill="url(#gfish)" stroke="#1c1c24" strokeWidth="0.8" />
    <circle cx="28" cy="25" r="15" fill="#06060e" stroke="#141418" strokeWidth="0.8" />
    <circle cx="28" cy="25" r="9" fill="#040408" stroke="#0e0e14" strokeWidth="0.8" />
    <circle cx="28" cy="25" r="1.5" fill="#ccff00" opacity="0.4" />
    <ellipse cx="18" cy="16" rx="8" ry="4" fill="rgba(255,255,255,0.08)" transform="rotate(-25 18 16)" />
  </svg>
);

export const LensTiltShift = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="gts" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#181820" />
        <stop offset="100%" stopColor="#060608" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="18" fill="#0f0f14" stroke="#1c1c22" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="13" fill="#0a0a0e" stroke="#161618" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="8" fill="url(#gts)" stroke="#12121a" strokeWidth="0.8" />
    <line x1="10" y1="20" x2="46" y2="36" stroke="rgba(204,255,0,0.18)" strokeWidth="1" strokeDasharray="3 2" />
    <circle cx="28" cy="28" r="3" fill="#060608" />
    <circle cx="28" cy="28" r="1.2" fill="#ccff00" opacity="0.5" />
  </svg>
);

export const LensLensbaby = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 56 56" className={className}>
    <defs>
      <radialGradient id="glb" cx="30%" cy="35%">
        <stop offset="0%" stopColor="#1a1520" />
        <stop offset="100%" stopColor="#080610" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="16" fill="#0e0c12" stroke="#1a1820" strokeWidth="0.8" />
    <circle cx="26" cy="26" r="11" fill="#0a080e" stroke="#141218" strokeWidth="0.8" />
    <circle cx="25" cy="25" r="7" fill="url(#glb)" stroke="#101018" strokeWidth="0.8" />
    <ellipse cx="22" cy="22" rx="3" ry="1.5" fill="rgba(255,255,255,0.06)" transform="rotate(-40 22 22)" />
    <circle cx="25" cy="25" r="1.2" fill="#ccff00" opacity="0.45" />
  </svg>
);

// Type icons for lens type selector
export const LensPrimeIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 56 56" className={className}>
    <circle cx="28" cy="28" r="17" fill="#151515" stroke="#252525" strokeWidth="1" />
    <circle cx="28" cy="28" r="12" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="7" fill="#060606" stroke="#161616" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity="0.5" />
  </svg>
);

export const LensAnamorphicIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 56 56" className={className}>
    <rect x="6" y="20" width="44" height="16" rx="4" fill="#0d0d10" stroke="#1c1c22" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="16" ry="8" fill="#070709" stroke="#1a1a1e" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="8" ry="4" fill="#050507" stroke="#141416" strokeWidth="0.8" />
    <ellipse cx="28" cy="28" rx="1.5" ry="0.8" fill="#ccff00" opacity="0.5" />
  </svg>
);

export const LensMacroIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 56 56" className={className}>
    <circle cx="28" cy="28" r="20" fill="none" stroke="#1c1c1c" strokeWidth="2.5" />
    <circle cx="28" cy="28" r="14" fill="#0a0a0a" stroke="#161616" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="8" fill="#070707" stroke="#141414" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="4" fill="#101818" stroke="#182020" strokeWidth="0.8" />
    <circle cx="28" cy="28" r="1.5" fill="#ccff00" opacity="0.5" />
  </svg>
);

export const LensSpecialIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 56 56" className={className}>
    <circle cx="28" cy="28" r="22" fill="#111116" stroke="#1e1e26" strokeWidth="0.8" />
    <circle cx="28" cy="26" r="16" fill="#08080e" stroke="#161620" strokeWidth="0.8" />
    <circle cx="28" cy="25" r="10" fill="#050508" stroke="#101016" strokeWidth="0.8" />
    <circle cx="28" cy="25" r="1.5" fill="#ccff00" opacity="0.4" />
    <ellipse cx="18" cy="18" rx="6" ry="3" fill="rgba(255,255,255,0.07)" transform="rotate(-25 18 18)" />
  </svg>
);

// Map focal values to icons
export const FOCAL_ICONS: Record<string, React.FC<{ className?: string }>> = {
  "14": Lens14mm,
  "24": Lens24mm,
  "35": Lens35mm,
  "50": Lens50mm,
  "85": Lens85mm,
  "135": Lens135mm,
  "1.33x": LensAnamorphic133,
  "1.5x": LensAnamorphic15,
  "2x": LensAnamorphic2x,
  "60": LensMacro60mm,
  "100": LensMacro100mm,
  "180": LensMacro180mm,
  "fisheye": LensFisheye,
  "tilt-shift": LensTiltShift,
  "lensbaby": LensLensbaby,
};

// Map lens type to icon
export const LENS_TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  prime: LensPrimeIcon,
  anamorphic: LensAnamorphicIcon,
  macro: LensMacroIcon,
  special: LensSpecialIcon,
};
