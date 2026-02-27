import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  Zap,
  ArrowRight,
  Star,
  CheckCircle2,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/landing/Navigation";
import Services from "@/components/landing/Services";
import About from "@/components/landing/About";
import VideoSection from "@/components/landing/VideoSection";
import TrainingCTA from "@/components/landing/TrainingCTA";
import PelikulartFooter from "@/components/landing/PelikulartFooter";
import FloatingPromoBanner from "@/components/landing/FloatingPromoBanner";

import heroBg1 from "@/assets/hero-bg-1.jpg";
import heroBg2 from "@/assets/hero-bg-2.jpg";
import heroBg3 from "@/assets/hero-bg-3.jpg";
import heroVideo1 from "@/assets/hero-video.mp4";
import heroVideo2 from "@/assets/hero-video-2.mp4";

/* ─── Data ─── */

const heroSlides = [
  {
    type: "video" as const,
    src: heroVideo1,
    tag: "NOUVEAU",
    title: "LA RÉVOLUTION DE L'IMAGE PAR L'IA",
    desc: "Où la pellicule rencontre le futur. Créez des visuels et vidéos cinématiques avec l'intelligence artificielle.",
    cta: "NOS CRÉATIONS",
  },
  {
    type: "image" as const,
    src: heroBg1,
    tag: "CLIPS IA",
    title: "PORTRAITS IA & FORMATS LONGS",
    desc: "Créez des portraits époustouflants et des vidéos cinématiques avec notre technologie IA de pointe.",
    cta: "ESSAYER MAINTENANT",
  },
  {
    type: "video" as const,
    src: heroVideo2,
    tag: "VIDÉO IA",
    title: "VIDÉOS CINÉMATIQUES EN UN CLIC",
    desc: "Générez des vidéos HD de 15 secondes. Scènes africaines, transitions fluides, qualité studio.",
    cta: "CRÉER UNE VIDÉO",
  },
  {
    type: "image" as const,
    src: heroBg2,
    tag: "PELIKULART BOOST",
    title: "L'AFRIQUE RENCONTRE LE FUTUR",
    desc: "Notre moteur Pelikulart Boost enrichit vos prompts avec des références culturelles africaines pour des résultats uniques.",
    cta: "DÉCOUVRIR",
  },
  {
    type: "image" as const,
    src: heroBg3,
    tag: "CRÉATEURS",
    title: "CONÇU POUR LES CRÉATEURS AFRICAINS",
    desc: "Payez avec Mobile Money, générez en connexion limitée. Pelikulart AI est fait pour vous.",
    cta: "COMMENCER",
  },
];

const highlights = [
  { value: "50K+", label: "Images générées" },
  { value: "12K+", label: "Créateurs actifs" },
  { value: "98%", label: "Satisfaction" },
  { value: "< 10s", label: "Temps de génération" },
];

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Directrice Marketing, Dakar",
    text: "Pelikulart AI a révolutionné notre processus créatif. Nous produisons 10x plus de contenu visuel en un temps record.",
    avatar: "AD",
  },
  {
    name: "Kwame Asante",
    role: "Créateur de contenu, Accra",
    text: "Enfin un outil qui comprend l'esthétique africaine. Les résultats sont bluffants, mes abonnés adorent.",
    avatar: "KA",
  },
  {
    name: "Fatoumata Traoré",
    role: "Entrepreneur, Abidjan",
    text: "Le paiement via Mobile Money m'a convaincu. Simple, rapide, et les crédits sont très abordables.",
    avatar: "FT",
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
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [promptText, setPromptText] = useState("");

  const nextSlide = useCallback(() => {
    setCurrentSlide((p) => (p + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!loading && user) return <Navigate to="/studio" replace />;

  const slide = heroSlides[currentSlide];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <Navigation />

      {/* ─── Hero Carousel ─── */}
      <section className="relative pt-14 h-[85vh] min-h-[600px] max-h-[900px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {slide.type === "video" ? (
              <video
                src={slide.src}
                autoPlay
                muted
                playsInline
                loop
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={slide.src}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20 px-5 md:px-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                {slide.tag}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4 uppercase text-white">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-6 max-w-md">
                {slide.desc}
              </p>
              <Link
                to="/studio"
                className="btn-generate !py-3 !px-8 !text-sm inline-flex items-center gap-2"
              >
                {slide.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Prompt bar */}
          <div className="mt-8 max-w-xl">
            <div className="glass rounded-2xl p-1.5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Décrivez ce que vous voulez créer..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 px-4 py-3 outline-none"
              />
              <Link
                to="/studio"
                className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </Link>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-8 bg-primary"
                      : "w-3 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Services (Accordion) ─── */}
      <Services />

      {/* ─── Stats Banner ─── */}
      <section className="py-14 px-5 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {highlights.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        className="py-20 md:py-28 px-5 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase tracking-tight">
              TARIFS <span className="text-primary">ACCESSIBLES</span>
            </h2>
            <p className="text-muted-foreground">
              Payez en FCFA avec Mobile Money. Sans carte bancaire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`glass-card p-6 relative transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/30 glow-lime"
                    : hoveredPlan === i
                    ? "border-muted-foreground/20"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    POPULAIRE
                  </div>
                )}
                <h3 className="font-bold text-lg mb-1 uppercase">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.credits} Cauris
                </p>
                <p className="text-3xl font-black mb-1">
                  {plan.price}{" "}
                  <span className="text-base font-normal text-muted-foreground">FCFA</span>
                </p>
                <ul className="space-y-2 my-6 text-sm text-muted-foreground">
                  {["Images & vidéos IA", "Pelikulart Boost inclus", "Téléchargement HD"].map(
                    (feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {feat}
                      </li>
                    )
                  )}
                </ul>
                <Link
                  to="/pricing"
                  className={`block text-center rounded-xl py-3 text-sm font-bold transition-all uppercase tracking-wider ${
                    plan.popular
                      ? "btn-generate !animate-none"
                      : "glass glass-hover text-foreground"
                  }`}
                >
                  Choisir ce forfait
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-20 md:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase tracking-tight">
              ILS NOUS FONT <span className="text-primary">CONFIANCE</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <About />

      {/* ─── Video Showcase ─── */}
      <VideoSection />

      {/* ─── Training CTA ─── */}
      <TrainingCTA />

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
              PRÊT À CRÉER AVEC{" "}
              <span className="text-primary">PELIKULART AI</span> ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Rejoignez des milliers de créateurs africains. 50 crédits gratuits, sans engagement.
            </p>
            <Link
              to="/studio"
              className="btn-generate !py-4 !px-10 !text-base inline-flex items-center gap-2 animate-pulse-glow"
            >
              <Zap className="w-5 h-5" />
              CRÉER MON COMPTE GRATUIT
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <PelikulartFooter />

      {/* ─── Floating Promo ─── */}
      <FloatingPromoBanner />
    </div>
  );
};

export default LandingPage;
