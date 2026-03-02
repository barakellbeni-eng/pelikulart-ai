import { useState } from "react";
import { motion } from "framer-motion";
import pelikulartLogo from "@/assets/pelikulart-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any).from("waitlist").insert({ email: email.trim() });
      if (error) {
        if (error.code === "23505") {
          toast.info("Vous êtes déjà inscrit(e) !");
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast.success("Merci ! Vous serez notifié(e) au lancement.");
      }
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden"
      style={{ backgroundColor: "#000" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, hsl(23 100% 50% / 0.08), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center w-full max-w-lg"
      >
        {/* Logo */}
        <img
          src={pelikulartLogo}
          alt="Pelikulart AI"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mb-6 sm:mb-8"
          style={{ boxShadow: "0 0 60px hsl(23 100% 50% / 0.35)" }}
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight"
          style={{ color: "#fff" }}
        >
          Quelque chose de grand arrive
          <span className="text-gradient-primary">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xs sm:text-sm md:text-base mb-8 sm:mb-10 px-2"
          style={{ color: "hsl(0 0% 50%)" }}
        >
          Soyez les premiers informés du lancement de Pelikulart AI.
        </motion.p>

        {/* Email form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full flex flex-col sm:flex-row gap-3"
        >
          {submitted ? (
            <div className="w-full py-3 px-4 rounded-xl text-center text-sm font-medium" style={{ color: "hsl(23 100% 50%)", border: "1px solid hsl(23 100% 50% / 0.3)", background: "hsl(23 100% 50% / 0.05)" }}>
              ✓ Inscription confirmée !
            </div>
          ) : (
            <>
              <input
                type="email"
                required
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-11 sm:h-12 px-4 rounded-xl text-sm outline-none transition-all duration-200 w-full"
                style={{
                  backgroundColor: "hsl(0 0% 8%)",
                  border: "1px solid hsl(0 0% 15%)",
                  color: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(23 100% 50% / 0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(0 0% 15%)")}
              />
              <button
                type="submit"
                disabled={loading}
                className="h-11 sm:h-12 px-6 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 disabled:opacity-50 w-full sm:w-auto"
                style={{
                  background: "hsl(23 100% 50%)",
                  color: "#000",
                  boxShadow: "0 4px 25px hsl(23 100% 50% / 0.3)",
                }}
              >
                {loading ? "..." : "Me notifier"}
              </button>
            </>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
