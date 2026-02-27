import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-10 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
            <span className="text-primary">À PROPOS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-1 lg:order-1 flex justify-center lg:justify-end"
          >
            <div className="relative group w-full max-w-sm md:max-w-md lg:max-w-xs">
              <div className="relative z-10 border-4 border-primary overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all duration-500 group-hover:shadow-[0_0_50px_hsl(var(--primary)/0.4)] rounded-lg">
                <div className="relative aspect-[4/5] overflow-hidden bg-background">
                  <img
                    src="https://i.postimg.cc/njqy8RN7/image.jpg"
                    alt="Barakell Beni - CEO Pelikulart.ai"
                    className="w-full h-full object-cover filter grayscale contrast-110 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 mix-blend-multiply" />
                </div>
              </div>
              <div className="absolute -top-4 -left-4 w-1/2 h-1/2 border-t-2 border-l-2 border-primary/50 z-0 transition-all duration-500 group-hover:-top-6 group-hover:-left-6 group-hover:border-primary" />
              <div className="absolute -bottom-4 -right-4 w-1/2 h-1/2 border-b-2 border-r-2 border-primary/50 z-0 transition-all duration-500 group-hover:-bottom-6 group-hover:-right-6 group-hover:border-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 md:space-y-6 order-2 lg:order-2"
          >
            <h3 className="text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight text-center lg:text-left">
              Barakell Beni
              <span className="block text-primary text-xl md:text-2xl mt-2 tracking-widest font-normal">
                CEO & Directeur Créatif
              </span>
            </h3>

            <div className="space-y-4 md:space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed font-light text-center lg:text-left">
              <p>
                La médiocrité n'a jamais été une option. Dans un monde où l'on se contente trop souvent du "suffisant", j'ai choisi de repousser sans cesse les frontières de la création visuelle. Mon refus catégorique de la complaisance m'a conduit à embrasser l'intelligence artificielle non pas comme un outil, mais comme un partenaire dans la quête de l'excellence absolue.
              </p>
              <p>
                Le cinéma africain mérite plus que des productions à petit budget et des histoires répétitives. Il mérite une révolution. À travers <span className="text-foreground font-bold">PELIKULART.AI</span>, je fusionne la richesse narrative de nos cultures avec les technologies les plus avancées.
              </p>
              <p>
                De <span className="text-primary font-semibold">Cotonou</span> à <span className="text-primary font-semibold">Abidjan</span>, je dirige une nouvelle génération de créateurs qui refusent de se laisser limiter. L'IA générative nous offre une liberté créative sans précédent—la liberté de visualiser l'impossible.
              </p>

              <motion.div
                className="bg-white/5 border-l-4 border-primary p-4 md:p-6 mt-6 md:mt-8 rounded-md"
                whileHover={{ x: 10 }}
              >
                <p className="text-primary font-semibold italic text-lg md:text-xl">
                  "L'excellence n'est pas un luxe. C'est notre droit."
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
