import confetti from "canvas-confetti";

/**
 * Launch a rich confetti burst from both sides + center
 */
export const launchConfetti = () => {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 80,
    zIndex: 9999,
    colors: ["#e67e00", "#CCFF00", "#FFD700", "#FF6B00", "#00FF88", "#ffffff"],
  };

  // Center burst
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.4 } });

  // Left burst
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.2, y: 0.5 }, angle: 60 });
  }, 150);

  // Right burst
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.8, y: 0.5 }, angle: 120 });
  }, 300);

  // Final shower
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0 },
      startVelocity: 45,
      gravity: 1.2,
      ticks: 120,
      zIndex: 9999,
      colors: ["#e67e00", "#CCFF00", "#FFD700"],
    });
  }, 500);
};

/**
 * Play a bright success chime with harmonics
 */
export const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const reverb = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime + startTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(g);
      g.connect(reverb);
      reverb.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Rising chime: C6 → E6 → G6 → C7
    playTone(1047, 0, 0.3, 0.15);
    playTone(1319, 0.1, 0.3, 0.12);
    playTone(1568, 0.2, 0.4, 0.1);
    playTone(2093, 0.35, 0.6, 0.08);

    setTimeout(() => ctx.close(), 2000);
  } catch (e) {
    console.warn("Audio not supported", e);
  }
};
