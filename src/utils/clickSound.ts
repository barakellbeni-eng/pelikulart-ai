let audioCtx: AudioContext | null = null;

export const playClickSound = () => {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;

    // Create a short ping oscillator
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

    // Gain envelope — short click
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    // Simple convolver reverb via delay feedback
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.06;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.25;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.15;

    // Route: osc -> gain -> destination (dry)
    //                    -> delay -> feedback -> delay (loop)
    //                    -> reverbGain -> destination (wet)
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(reverbGain);
    reverbGain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Silently fail if audio not supported
  }
};
