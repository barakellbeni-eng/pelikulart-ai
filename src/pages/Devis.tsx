import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import pelikulartLogo from "@/assets/pelikulart-logo.jpeg";
import PelikulartFooter from "@/components/landing/PelikulartFooter";

const Devis = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={pelikulartLogo} alt="Pelikulart AI" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold tracking-[0.15em] uppercase text-white">
              PELIKULART<span className="text-primary">.</span>AI
            </span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </nav>

      <div className="min-h-screen pt-24 md:pt-28 pb-12 md:pb-20 relative overflow-hidden">
        <div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-900/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">
                PROJET SUR MESURE
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-12">
              Sélectionnez les services dont vous avez besoin. Notre outil calculera une estimation instantanée
              que vous pourrez nous envoyer pour validation.
            </p>
          </motion.div>

          {/* Placeholder - le QuoteBuilder et QuoteForm seront ajoutés plus tard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 md:p-12 text-center"
          >
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Bientôt disponible</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Notre simulateur de devis interactif est en cours de développement.
              Contactez-nous directement à{" "}
              <a href="mailto:agence@pelikulart.ai" className="text-primary hover:underline">
                agence@pelikulart.ai
              </a>{" "}
              pour obtenir un devis personnalisé.
            </p>
          </motion.div>
        </div>
      </div>

      <PelikulartFooter />
    </div>
  );
};

export default Devis;
