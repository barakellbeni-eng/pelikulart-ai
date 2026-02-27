import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GraduationCap, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
  "Maîtrisez les outils IA",
  "Créez votre propre univers",
  "Boostez votre carrière",
];

const TrainingCTA = () => {
  return (
    <section className="py-10 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/10 bg-[#0A0A0A] group shadow-2xl hover:shadow-[0_0_60px_hsl(var(--primary)/0.05)] transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-black to-black opacity-80" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.08),_transparent_50%)]" />

          <div className="relative p-6 sm:p-8 md:p-16 lg:p-20 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-4 md:mb-6 inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs md:text-base uppercase tracking-wider"
            >
              <Sparkles size={14} className="md:w-4 md:h-4" />
              <span>Formation Exclusive</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-[1.1] tracking-tight max-w-4xl">
              Devenez un Expert de la{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                Création Vidéo IA
              </span>
            </h2>

            <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl leading-relaxed">
              Ne soyez plus spectateur de la révolution technologique. Apprenez à
              dompter les algorithmes pour donner vie à votre imagination sans
              limite.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-8 mb-8 md:mb-12">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-center gap-2 text-foreground/80"
                >
                  <CheckCircle2 className="text-primary" size={18} />
                  <span className="font-medium text-sm md:text-base">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/formation"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 md:px-12 md:py-6 bg-primary text-primary-foreground font-black text-base md:text-xl rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] whitespace-nowrap overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 md:gap-3">
                  <GraduationCap size={20} className="md:w-7 md:h-7" strokeWidth={2.5} />
                  DÉMARRER LA FORMATION
                  <ArrowRight size={18} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrainingCTA;
