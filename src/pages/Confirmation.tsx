import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Home, ExternalLink } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Confirmation = () => {
  const { state } = useLocation();
  const { toast } = useToast();

  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { email, trainingName, code, link } = state as {
    email: string;
    trainingName: string;
    code: string;
    link: string;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${type} copié dans le presse-papier.`,
      className: "bg-primary text-primary-foreground border-none",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl glass-card p-8 md:p-12 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 glow-lime"
          >
            <CheckCircle size={48} className="text-primary-foreground" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Félicitations !</h1>
          <p className="text-muted-foreground text-lg">
            Votre inscription à <span className="text-foreground font-bold">{trainingName}</span> est confirmée.
            <br className="hidden md:block" />
            Un email de confirmation a été envoyé à <span className="text-primary">{email}</span>.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-bold">Votre Code d'accès</p>
            <div className="flex items-center gap-4">
              <code className="flex-1 bg-background/50 border border-border rounded-lg p-4 text-2xl font-mono text-primary tracking-widest font-bold text-center">
                {code}
              </code>
              <button
                onClick={() => copyToClipboard(code, "Code")}
                className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-foreground"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-bold">Lien d'accès à la formation</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-background/50 border border-border rounded-lg p-4 text-foreground/90 truncate font-mono text-sm">
                {link}
              </div>
              <button
                onClick={() => copyToClipboard(link, "Lien")}
                className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-foreground"
              >
                <Copy size={24} />
              </button>
            </div>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors font-bold"
            >
              Accéder maintenant <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Home size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;
