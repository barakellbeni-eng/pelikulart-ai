import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pelikulartLogo from "@/assets/pelikulart-logo.png";

interface StudioSplashProps {
  onFinish: () => void;
}

const StudioSplash = ({ onFinish }: StudioSplashProps) => {
  const [phase, setPhase] = useState<"logo" | "text" | "out">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("out"), 2200);
    const t3 = setTimeout(() => onFinish(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== "out" ? null : null}
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(0 0% 100% / 0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "out" ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={() => {
          if (phase === "out") onFinish();
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <img
            src={pelikulartLogo}
            alt="Pelikulart AI"
            className="w-16 h-16 rounded-xl shadow-2xl"
            style={{ boxShadow: "0 0 50px hsl(23 100% 50% / 0.4)" }}
          />
        </motion.div>

        {/* Brand text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === "logo" ? 0 : 1, y: phase === "logo" ? 10 : 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
            Pelikulart <span className="text-lime">AI</span>
          </h1>
          <p className="text-xs text-white/40 mt-2 tracking-wider uppercase">Studio IA</p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="mt-8 w-48 h-0.5 bg-white/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "logo" ? 0 : 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-lime rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudioSplash;
