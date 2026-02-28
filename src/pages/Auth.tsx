import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import pelikulartLogo from "@/assets/pelikulart-logo.jpeg";
import PaymentMarquee from "@/components/PaymentMarquee";

const VIDEO_URLS = [
  "https://app.videas.fr/embed/media/c0811c06-78fb-45d2-95a0-66f2c7658863/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=true&thumbnail=video",
  "https://app.videas.fr/embed/media/afcdb619-1b97-481b-b5af-0ddd44fc37b1/?title=false&logo=false&thumbnail_duration=false&controls=false&autoplay=true&loop=true&info=true&thumbnail=video",
];
const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % VIDEO_URLS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-lime" />
      </div>
    );
  }

  if (user) return <Navigate to="/studio" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Vérifiez votre email pour confirmer votre inscription.");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left — Video showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.iframe
            key={videoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            src={VIDEO_URLS[videoIndex]}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0 scale-[1.8]"
            style={{ objectFit: 'cover' }}
            referrerPolicy="unsafe-url"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
          <h2 className="text-3xl font-bold text-white leading-tight mb-2">
            Les meilleures IA créatives
          </h2>
          <p className="text-white/60 text-base max-w-md">
            Sans engagement, payable en Wave, Orange Money ou MoMo.
          </p>
        </div>
      </div>

      {/* Logo top-left */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <img src={pelikulartLogo} alt="Pelikulart" className="w-9 h-9 rounded-lg" />
        <span className="text-white font-bold text-lg tracking-tight">Pelikulart</span>
      </Link>

      {/* Right — Auth form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            {isLogin ? "Se connecter" : "Créer un compte"}
          </h1>
          <p className="text-center text-white/50 text-sm mb-8">
            {isLogin ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }} className="text-lime font-semibold hover:underline">
                  S'inscrire
                </button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }} className="text-lime font-semibold hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>

          {isLogin && showForgot ? (
            <div className="space-y-4">
              <p className="text-sm text-white/50">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <input
                type="email"
                placeholder="Email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
              />
              {forgotSuccess && (
                <p className="text-sm text-lime bg-lime/10 rounded-lg px-4 py-2">{forgotSuccess}</p>
              )}
              {forgotError && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">{forgotError}</p>
              )}
              <button
                type="button"
                disabled={forgotSubmitting}
                onClick={async () => {
                  setForgotError("");
                  setForgotSuccess("");
                  setForgotSubmitting(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) setForgotError(error.message);
                  else setForgotSuccess("Un email de réinitialisation a été envoyé !");
                  setForgotSubmitting(false);
                }}
                className="w-full bg-white text-black font-semibold rounded-lg py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {forgotSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le lien"}
              </button>
              <button type="button" onClick={() => setShowForgot(false)} className="text-sm text-lime hover:underline w-full text-center">
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-white/15 rounded-lg px-4 pr-10 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
              )}
              {success && (
                <p className="text-sm text-lime bg-lime/10 rounded-lg px-4 py-2">{success}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black font-semibold rounded-lg py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? "Se connecter" : "Suivant"
                )}
              </button>

              {isLogin && (
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-white/40 hover:text-white/60 w-full text-center transition-colors">
                  Mot de passe oublié ?
                </button>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <button
            onClick={async () => {
              setError("");
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin + "/studio",
              });
              if (error) setError(error.message);
            }}
            className="w-full flex items-center justify-center gap-3 border border-white/15 rounded-lg py-3.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLogin ? "Se connecter avec Google" : "S'inscrire avec Google"}
          </button>

          {/* Payment logos */}
          <div className="mt-6">
            <PaymentMarquee size="sm" showSignupCTA />
          </div>

          {/* Legal */}
          <p className="text-center text-[11px] text-white/25 mt-6 leading-relaxed">
            En cliquant sur "S'inscrire avec Google" vous acceptez nos{" "}
            <Link to="/conditions-utilisation" className="text-white/40 hover:text-white/60 underline">Conditions d'utilisation</Link>
            {" "}et reconnaissez avoir lu notre{" "}
            <Link to="/politique-confidentialite" className="text-white/40 hover:text-white/60 underline">Politique de confidentialité</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
