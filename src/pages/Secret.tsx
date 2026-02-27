import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Secret = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    name = "Créateur",
    trainingName = "Formation IA",
    code = "MINORITE",
  } = (location.state as Record<string, string>) || {};

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié !",
      description: "Le code a été copié dans votre presse-papier.",
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--accent)/0.1)_0%,_transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 max-w-2xl w-full glass-card p-8 md:p-12"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-8 glow-lime"
          >
            <CheckCircle size={40} className="text-primary-foreground" />
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient-primary">
            Félicitations, {name.split(' ')[0]} !
          </h1>

          <p className="text-muted-foreground text-lg mb-8 max-w-md">
            Votre accès à <span className="text-foreground font-bold">{trainingName}</span> est confirmé. Vous faites maintenant partie de l'élite.
          </p>

          <div className="w-full bg-muted/30 border border-border rounded-2xl p-6 mb-8 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent" />

            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <Lock size={12} /> Votre Code Secret
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl md:text-5xl font-bold tracking-wider text-primary drop-shadow-lg font-mono">
                {code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-muted hover:bg-muted/80 rounded-xl transition-colors text-foreground"
              >
                <Copy size={20} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Conservez ce code précieusement. Il vous sera demandé pour accéder aux ressources exclusives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={() => window.location.href = "https://barakellbeni.com/formationupdate"}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg rounded-xl"
            >
              Accéder à la formation <ArrowRight className="ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 border-border text-foreground hover:bg-muted py-6 text-lg rounded-xl"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Secret;
