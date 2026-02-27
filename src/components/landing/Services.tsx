import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Aperture, Megaphone, GraduationCap, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      icon: Film,
      title: 'Clips IA & Vidéos Courtes',
      description: 'Réalisez des clips musicaux ou reels viraux en un temps record, avec une ambiance visuelle forte et un rythme parfait. Des formats immersifs et percutants, pensés pour captiver dès les premières secondes.',
      cta: null,
    },
    {
      id: 2,
      icon: Aperture,
      title: 'Portraits IA & Formats Longs',
      description: "Donnez vie à votre identité visuelle ou racontez une histoire en images IA, avec une narration et une esthétique forte. Une vision plus profonde et artistique, pour créer un vrai univers autour de votre projet.",
      cta: null,
    },
    {
      id: 3,
      icon: Megaphone,
      title: 'Publicité IA & Voix Off',
      description: "Créez des vidéos de marque ou des spots narratifs, avec voix synthétique intégrée et rendu haut de gamme. Idéal pour les créateurs, marques ou entrepreneurs qui veulent une communication unique.",
      cta: null,
    },
    {
      id: 4,
      icon: GraduationCap,
      title: 'Formations & Sur-Mesure',
      description: "Apprenez à créer vous-même ou laissez-nous façonner pour vous un univers visuel personnalisé et stratégique. Une approche humaine, pédagogique et visionnaire autour de la création par IA.",
      link: '/formation',
      isInternal: true,
      cta: 'Voir le programme',
    },
  ];

  const toggleService = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="services" className="py-10 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter text-foreground">
            NOS <span className="text-primary">SERVICES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Une expertise pointue pour donner vie à vos idées les plus ambitieuses.
          </p>
        </motion.div>

        <div className="space-y-3 md:space-y-4">
          {services.map((service) => {
            const Icon = service.icon;
            const isExpanded = expandedId === service.id;

            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className={`
                  group relative rounded-xl border transition-all duration-300 overflow-hidden w-full
                  ${isExpanded
                    ? 'bg-card border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.1)]'
                    : 'bg-secondary/30 border-border hover:border-muted-foreground/20 hover:bg-card'
                  }
                `}
              >
                <div
                  onClick={() => toggleService(service.id)}
                  className="p-4 md:p-6 flex items-center justify-between cursor-pointer select-none min-h-[70px] md:min-h-[80px]"
                >
                  <div className="flex items-center gap-3 md:gap-6 flex-1 pr-2">
                    <div className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300
                      ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}
                    `}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h3 className={`text-base md:text-xl font-bold transition-colors ${isExpanded ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                      {service.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <span className={`text-xs md:text-sm font-medium hidden sm:block transition-colors ${isExpanded ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'}`}>
                      {isExpanded ? 'Fermer' : 'En savoir plus'}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-1.5 md:p-2 rounded-full ${isExpanded ? 'bg-muted text-primary' : 'bg-transparent text-muted-foreground group-hover:text-primary'}`}
                    >
                      <ChevronDown size={18} className="md:w-5 md:h-5" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-5 pt-0 md:px-6 md:pl-[88px] md:pr-8">
                        <div className="h-px w-full bg-border mb-4 md:mb-5" />
                        <p className="text-muted-foreground leading-relaxed mb-5 md:mb-6 text-sm md:text-base">
                          {service.description}
                        </p>

                        {service.cta && service.isInternal && service.link && (
                          <Link
                            to={service.link}
                            onClick={() => window.scrollTo(0, 0)}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 min-h-[44px]"
                          >
                            {service.cta} <ArrowRight size={16} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
