import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Image,
  Video,
  ArrowRight,
  Star,
  Users,
  Globe,
  Shield,
  ChevronRight,
  Play,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Créations générées" },
  { value: "12K+", label: "Utilisateurs actifs" },
  { value: "98%", label: "Satisfaction client" },
  { value: "15+", label: "Pays africains" },
];

const features = [
  {
    icon: Image,
    title: "Génération d'images IA",
    description:
      "Créez des visuels époustouflants inspirés de l'esthétique africaine en quelques secondes grâce à nos modèles entraînés.",
  },
  {
    icon: Video,
    title: "Vidéos IA haute qualité",
    description:
      "Transformez vos idées en vidéos captivantes avec le modèle Kling v2, optimisé pour le contenu africain.",
  },
  {
    icon: Sparkles,
    title: "AFRIKA BOOST",
    description:
      "Notre moteur exclusif enrichit vos prompts avec des références culturelles africaines pour des résultats uniques.",
  },
  {
    icon: Globe,
    title: "Paiement Mobile Money",
    description:
      "Payez facilement avec MTN MoMo, Wave ou Orange Money. Conçu pour l'Afrique, par l'Afrique.",
  },
  {
    icon: Zap,
    title: "Ultra rapide",
    description:
      "Génération en moins de 10 secondes. Notre infrastructure est optimisée pour une expérience fluide même en connexion limitée.",
  },
  {
    icon: Shield,
    title: "Vos créations protégées",
    description:
      "Chaque image et vidéo générée vous appartient. Stockage sécurisé et téléchargement HD illimité.",
  },
];

const testimonials = [
  {
    name: "Aminata Diallo",
    role: "Directrice Marketing, Dakar",
    text: "AFRIKA DRIVE a révolutionné notre processus créatif. Nous produisons 10x plus de contenu visuel en un temps record.",
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const LandingPage = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient-primary">AFRIKA</span>{" "}
              <span className="text-foreground">DRIVE</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">
              Témoignages
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/studio"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/studio"
              className="btn-generate !px-5 !py-2.5 !text-sm !rounded-xl !animate-none"
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">
              Propulsé par l'IA — Inspiré par l'Afrique
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Créez du contenu{" "}
            <span className="text-gradient-primary">visuel époustouflant</span>{" "}
            avec l'IA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            La première plateforme de génération d'images et vidéos par IA, conçue
            pour les créateurs africains. Payez avec Mobile Money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/studio"
              className="btn-generate !py-4 !px-10 !text-base flex items-center gap-2 animate-pulse-glow"
            >
              <Zap className="w-5 h-5" />
              Essayer gratuitement
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 glass glass-hover rounded-xl px-8 py-4 text-sm font-medium text-muted-foreground"
            >
              <Play className="w-4 h-4 text-primary" />
              Voir la démo
            </a>
          </motion.div>
        </div>

        {/* Preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-5xl mx-auto mt-16 md:mt-24"
        >
          <div className="glass-card p-2 md:p-3 glow-orange">
            <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/10 via-card to-accent/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(32_100%_50%_/_0.08)_0%,_transparent_70%)]" />
              <div className="text-center space-y-4 relative z-10">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Image className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                    <Video className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Interface du Studio — Générez en un clic
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-gradient-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin pour{" "}
              <span className="text-gradient-primary">créer</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Des outils puissants, pensés pour les créateurs et entrepreneurs
              africains.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6 group hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section
        id="pricing"
        className="py-20 md:py-28 px-4 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Des tarifs <span className="text-gradient-gold">accessibles</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Payez en FCFA avec Mobile Money. Pas de carte bancaire requise.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`glass-card p-6 relative transition-all duration-300 ${
                  plan.popular
                    ? "border-primary/30 glow-orange"
                    : hoveredPlan === i
                    ? "border-white/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-destructive text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    POPULAIRE
                  </div>
                )}
                <h3 className="font-bold text-lg mb-1 text-foreground">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.credits} crédits AD
                </p>
                <p className="text-3xl font-extrabold text-foreground mb-1">
                  {plan.price}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    FCFA
                  </span>
                </p>
                <ul className="space-y-2 my-6 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Images & vidéos IA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    AFRIKA BOOST inclus
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Téléchargement HD
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className={`block text-center rounded-xl py-3 text-sm font-semibold transition-all ${
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

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils nous font <span className="text-gradient-primary">confiance</span>
            </h2>
            <p className="text-muted-foreground">
              Des milliers de créateurs africains utilisent AFRIKA DRIVE chaque jour.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-accent fill-accent"
                    />
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
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-3xl mx-auto glass-card p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(32_100%_50%_/_0.08)_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à créer avec{" "}
              <span className="text-gradient-primary">AFRIKA DRIVE</span> ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Rejoignez des milliers de créateurs africains. Commencez avec 50
              crédits gratuits, sans engagement.
            </p>
            <Link
              to="/studio"
              className="btn-generate !py-4 !px-10 !text-base inline-flex items-center gap-2 animate-pulse-glow"
            >
              <Zap className="w-5 h-5" />
              Créer mon compte gratuit
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">
              <span className="text-gradient-primary">AFRIKA</span>{" "}
              <span className="text-foreground">DRIVE</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
            <Link to="/studio" className="hover:text-foreground transition-colors">
              Studio
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 AFRIKA DRIVE. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
