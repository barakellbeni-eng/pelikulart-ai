import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Star, Crown, Sparkles, ShieldCheck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "discovery_500",
    name: "Formation Complète - 500F",
    price: "500",
    icon: Sparkles,
    description: "Accédez à notre formation complète avec tous les modules et ressources.",
    features: [
      "Accès complet aux modules",
      "Support email",
      "Certificat de formation",
      "Ressources téléchargeables",
    ],
    detailedDescription: {
      tagline: "Offre Découverte Exclusive",
      points: [
        "Programme complet accessible",
        "Support pédagogique inclus",
        "Certification de fin de parcours",
        "Accès 24/7 à la plateforme",
        "Mises à jour incluses",
      ],
    },
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "25 000",
    icon: Zap,
    description: "L'essentiel pour démarrer.",
    features: [
      "Accès aux bases de l'IA vidéo",
      "Génération de 50 images/mois",
      "Support par email (48h)",
      "1 projet guidé pas à pas",
      "Accès à la communauté Discord",
    ],
    detailedDescription: {
      tagline: "Parfait pour débuter",
      points: [
        "Accès aux bases de la création vidéo",
        "5 tutoriels vidéo complets",
        "Support par email",
        "Certificat de participation",
        "Accès à la communauté",
      ],
    },
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro IA",
    price: "50 000",
    icon: Star,
    description: "Pour les créateurs ambitieux.",
    features: [
      "Toutes les options Starter",
      "Techniques avancées de prompt",
      "Animation de personnages",
      "3 projets complets guidés",
      "Support prioritaire (24h)",
    ],
    detailedDescription: {
      tagline: "Pour progresser rapidement",
      points: [
        "Tout du STARTER",
        "Accès aux outils IA avancés",
        "15 tutoriels vidéo + 5 masterclass",
        "Support prioritaire",
        "Templates professionnels",
        "Accès illimité aux ressources",
      ],
    },
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite Coaching",
    price: "100 000",
    icon: Crown,
    description: "L'accompagnement ultime.",
    features: [
      "Toutes les options Pro IA",
      "Mentorat 1-on-1 (2h/mois)",
      "Analyse de votre portfolio",
      "Stratégie de monétisation",
      "Certification Expert",
    ],
    detailedDescription: {
      tagline: "Le pack complet",
      points: [
        "Tout du PRO IA",
        "Mentorat personnalisé 1-on-1",
        "30 tutoriels + 10 masterclass + coaching",
        "Support VIP 24/7",
        "Portfolio professionnel",
        "Certification avancée",
        "Accès à vie",
      ],
    },
    highlight: false,
  },
  {
    id: "pack_elev",
    name: "Pack Elev",
    price: "500",
    icon: Rocket,
    description: "L'expérience ultime pour propulser votre carrière.",
    features: [
      "Accès intégral Premium",
      "Masterclass Exclusives",
      "Support Prioritaire VIP",
      "Ressources Business & Templates",
      "Accès Communauté Élite",
    ],
    detailedDescription: {
      tagline: "Une élévation vers l'excellence",
      points: [
        "Programme complet + Bonus exclusifs",
        "Sessions de coaching de groupe",
        "Analyses de projets personnalisées",
        "Accès direct aux experts",
        "Mises à jour à vie incluses",
      ],
    },
    highlight: true,
  },
];

const TrainingOffers = () => {
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);

  const activePlanId = hoveredPlanId || selectedPlanId;
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[2];

  return (
    <section id="formations" className="py-8 md:py-24 bg-background relative overflow-hidden pb-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.03),_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl md:text-6xl font-bold mb-4 tracking-tighter text-foreground">
            NOS <span className="text-primary">FORMATIONS</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Choisissez le niveau d'accompagnement qui correspond à vos ambitions.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isSelected = selectedPlanId === plan.id;
            const isHovered = hoveredPlanId === plan.id;
            const isActive = isSelected || isHovered;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedPlanId(plan.id)}
                onMouseEnter={() => setHoveredPlanId(plan.id)}
                onMouseLeave={() => setHoveredPlanId(null)}
                className={cn(
                  "relative flex flex-col p-4 md:p-8 rounded-2xl transition-all duration-300 cursor-pointer group h-full overflow-hidden border",
                  isActive
                    ? "bg-gradient-to-br from-white/10 to-black border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.15)] md:scale-105 z-10 backdrop-blur-xl"
                    : "bg-gradient-to-br from-white/5 to-transparent border-white/5 opacity-90 hover:opacity-100 shadow-lg"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-opacity duration-300 pointer-events-none",
                    isActive ? "from-primary/5 to-transparent opacity-100" : "from-transparent to-transparent opacity-0"
                  )}
                />

                {plan.highlight && (
                  <div className="absolute top-0 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] md:text-xs font-black px-3 py-1 rounded-bl-xl md:rounded-bl-none md:rounded-b-lg uppercase tracking-widest shadow-[0_0_15px_hsl(var(--primary)/0.4)] whitespace-nowrap flex items-center gap-1 z-20">
                    <Star size={10} fill="currentColor" /> Recommandé
                  </div>
                )}

                <div className="mb-4 md:mb-6 relative z-10 mt-2">
                  <div
                    className={cn(
                      "w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors duration-300",
                      isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "bg-white/10 text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 my-2 md:my-3">
                    <span
                      className={cn(
                        "text-2xl md:text-4xl font-black transition-all duration-300",
                        isActive ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400" : "text-foreground"
                      )}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-xs md:text-sm font-medium">FCFA</span>
                  </div>
                  <div className={cn("h-px w-full my-3 md:my-4 transition-colors duration-300", isActive ? "bg-gradient-to-r from-primary/50 to-transparent" : "bg-white/10")} />
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed min-h-[40px]">{plan.description}</p>
                </div>

                <div className="flex-grow space-y-2 md:space-y-4 mb-6 md:mb-8 relative z-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 md:gap-3 px-1">
                      <div className="mt-0.5 min-w-[16px]">
                        <Check className={cn("w-4 h-4 md:w-5 md:h-5 transition-colors", isActive ? "text-primary" : "text-white/30")} />
                      </div>
                      <span className="text-foreground/80 text-sm md:text-base leading-tight md:leading-normal">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto relative z-10">
                  <button
                    className={cn(
                      "w-full py-3 md:py-3.5 rounded-lg md:rounded-xl font-bold uppercase tracking-wider text-xs md:text-sm transition-all duration-300 transform min-h-[44px]",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                        : "bg-white/10 text-foreground hover:bg-white/20 active:scale-95 border border-white/5"
                    )}
                  >
                    CHOISIR CE PLAN
                  </button>
                  {isActive && (
                    <div className="flex items-center justify-center gap-1.5 mt-2 md:mt-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                      <ShieldCheck size={10} className="text-primary md:w-3 md:h-3" />
                      Paiement sécurisé
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlanId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-gradient-to-br from-white/5 to-black rounded-2xl p-6 md:p-10 relative overflow-hidden shadow-2xl shadow-black/50 border border-white/5"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              <div className="w-full md:w-1/3">
                <h3 className="text-xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                  {activePlan.name}{" "}
                  <span className="text-primary text-[10px] md:text-xs font-bold px-2 py-0.5 bg-primary/10 rounded-full uppercase tracking-wider">
                    Détails
                  </span>
                </h3>
                <p className="text-primary text-base md:text-xl font-medium mb-3 md:mb-4">{activePlan.detailedDescription.tagline}</p>
                <div className="h-1 w-20 bg-primary rounded-full" />
              </div>
              <div className="w-full md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {activePlan.detailedDescription.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                      <Sparkles size={16} className="text-primary mt-1 shrink-0" />
                      <span className="text-foreground/90 text-sm md:text-base">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TrainingOffers;
