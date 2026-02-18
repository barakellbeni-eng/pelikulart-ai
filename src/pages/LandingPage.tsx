import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Star, CheckCircle2, Play } from "lucide-react";

import heroBg1 from "@/assets/hero-bg-1.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroVideo1 from "@/assets/hero-video.mp4";
import heroVideo2 from "@/assets/hero-video-2.mp4";

/* ─── Data ─── */

const heroSlides = [
  { type: "image" as const, src: heroBg1, subtitle: "Portraits Afrofuturistes" },
  { type: "video" as const, src: heroVideo1, subtitle: "Vidéos Cinématiques" },
  { type: "image" as const, src: heroBg2, subtitle: "L'Afrique rencontre le Futur" },
  { type: "video" as const, src: heroVideo2, subtitle: "Conçu pour les Créateurs" },
  { type: "image" as const, src: heroBg3, subtitle: "Du Wax au Pixel" },
];

const features = [
  {
    title: "Images IA",
    desc: "Visuels HD en quelques secondes, optimisés pour l'esthétique africaine.",
  },
  {
    title: "Vidéos IA",
    desc: "Transformez vos idées en séquences cinématiques de haute qualité.",
  },
  {
    title: "Cauris Boost",
    desc: "Enrichissez vos prompts avec des références culturelles uniques.",
  },
];

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Directrice Marketing, Dakar",
    text: "cauris.ai a révolutionné notre processus créatif. 10x plus de contenu en un temps record.",
    initials: "AD",
  },
  {
    name: "Kwame Asante",
    role: "Créateur de contenu, Accra",
    text: "Enfin un outil qui comprend l'esthétique africaine. Les résultats sont bluffants.",
    initials: "KA",
  },
  {
    name: "Fatoumata Traoré",
    role: "Entrepreneur, Abidjan",
    text: "Le paiement via Mobile Money m'a convaincu. Simple, rapide, abordable.",
    initials: "FT",
  },
];

const plans = [
  { name: "Starter", price: "2 500", credits: "50", popular: false },
  { name: "Créateur", price: "7 500", credits: "200", popular: true },
  { name: "Studio", price: "15 000", credits: "500", popular: false },
];

/* ─── Component ─── */

const LandingPage = () => {
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!loading && user) return <Navigate to="/studio" replace />;

  const slide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl tracking-tight">
            <span className="text-gradient-primary">cauris</span>
            <span className="text-foreground">.ai</span>
          </Link>

          <div className="hidden md:flex items-center gap-10 text-sm text-muted-foreground font-body">
            <a href="#features" className="hover:text-foreground transition-colors">Outils</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/auth"
              className="btn-generate !px-5 !py-2 !text-sm"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero — Full-screen cinematic ─── */}
      <section className="relative h-screen min-h-[600px]">
        {/* Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {slide.type === "video" ? (
              <video src={slide.src} autoPlay muted playsInline loop className="w-full h-full object-cover" />
            ) : (
              <img src={slide.src} alt={slide.subtitle} className="w-full h-full object-cover" />
            )}
            {/* Cinematic overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content — bottom-aligned, editorial */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-16 pb-20 md:pb-28 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 font-body font-medium">
              Intelligence artificielle créative
            </p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight mb-6 max-w-3xl">
              L'art africain<br />
              <span className="text-gradient-primary">réinventé</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed font-body">
              Créez des images et vidéos IA enracinées dans l'esthétique africaine. Du Sahel au Pixel.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="btn-generate !py-3.5 !px-8 !text-sm inline-flex items-center gap-2.5">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
                Découvrir →
              </a>
            </div>
          </motion.div>

          {/* Slide indicators — minimal dots */}
          <div className="flex gap-2 mt-12">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? "w-10 bg-primary" : "w-4 bg-foreground/15"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features — Clean editorial grid ─── */}
      <section id="features" className="py-28 md:py-36 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-20 max-w-xl">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3 font-body">Outils</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Trois outils,<br />des possibilités infinies
            </h2>
            <p className="text-muted-foreground leading-relaxed font-body">
              Des modèles IA de pointe, entraînés pour le contenu africain contemporain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-card p-8 md:p-10"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-primary font-body mb-6 block">
                  0{i + 1}
                </span>
                <h3 className="font-display text-2xl font-semibold mb-3">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Video Showcase ─── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Voyez par vous-même
            </h2>
            <p className="text-muted-foreground font-body">Tout est généré par l'IA.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[heroVideo1, heroVideo2].map((vid, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative rounded-xl overflow-hidden aspect-video group"
              >
                <video src={vid} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs bg-card/80 backdrop-blur px-3 py-1.5 rounded-full text-foreground/80 font-body">
                    Généré par IA
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-28 md:py-36 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3 font-body">Tarifs</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Accessible à tous
            </h2>
            <p className="text-muted-foreground font-body">
              Payez en FCFA avec Mobile Money. Sans carte bancaire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`rounded-xl p-7 transition-all duration-300 ${
                  plan.popular
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-card border border-border"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-primary font-body font-semibold mb-3">
                    Populaire
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-5 font-body">{plan.credits} cauris</p>
                <p className="text-3xl font-display font-bold mb-1">
                  {plan.price} <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <ul className="space-y-2 my-6 text-sm text-muted-foreground font-body">
                  {["Images & vidéos IA", "Cauris Boost inclus", "Téléchargement HD"].map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className={`block text-center rounded-lg py-2.5 text-sm font-medium transition-all font-body ${
                    plan.popular
                      ? "btn-generate !animate-none !py-2.5 !px-0 w-full"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  Choisir
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20 md:py-28 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Ils créent avec nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-ochre fill-ochre" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-body">
                  « {t.text} »
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary font-body">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-body">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 md:py-36 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-semibold mb-5">
            Prêt à créer ?
          </h2>
          <p className="text-muted-foreground mb-10 font-body">
            Rejoignez des milliers de créateurs africains. 50 crédits gratuits, sans engagement.
          </p>
          <Link
            to="/auth"
            className="btn-generate !py-4 !px-10 !text-base inline-flex items-center gap-2.5"
          >
            Créer mon compte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-base">
            <span className="text-gradient-primary">cauris</span>
            <span className="text-foreground">.ai</span>
          </span>
          <div className="flex items-center gap-8 text-sm text-muted-foreground font-body">
            <a href="#features" className="hover:text-foreground transition-colors">Outils</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a>
            <Link to="/auth" className="hover:text-foreground transition-colors">Studio</Link>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            © 2025 cauris.ai — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
