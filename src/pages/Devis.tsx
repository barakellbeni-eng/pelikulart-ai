import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/landing/Navigation";
import PelikulartFooter from "@/components/landing/PelikulartFooter";
import QuoteForm from "@/components/landing/QuoteForm";

const Devis = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="min-h-screen pt-24 md:pt-28 pb-12 md:pb-20 relative overflow-hidden">
        <div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-accent/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-4 uppercase">
              <Sparkles size={12} />
              <span>Simulateur de Devis</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              ESTIMEZ VOTRE <br className="hidden md:block" />
              <span className="text-gradient-primary">
                PROJET SUR MESURE
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-12">
              Sélectionnez les services dont vous avez besoin. Notre outil calculera une estimation instantanée
              que vous pourrez nous envoyer pour validation.
            </p>
          </motion.div>

          <QuoteForm />
        </div>
      </div>

      <PelikulartFooter />
    </div>
  );
};

export default Devis;
