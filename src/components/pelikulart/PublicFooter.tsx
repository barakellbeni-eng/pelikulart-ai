import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="bg-black border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-bold text-white">
                PELIKULART<span className="text-lime">.AI</span>
              </span>
            </div>
            <p className="text-sm text-white/50">
              La révolution de l'image par l'intelligence artificielle.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-white/50 hover:text-lime transition-colors">Accueil</Link>
              <Link to="/creations" className="text-sm text-white/50 hover:text-lime transition-colors">Créations</Link>
              <Link to="/training" className="text-sm text-white/50 hover:text-lime transition-colors">Formation</Link>
              <Link to="/devis" className="text-sm text-white/50 hover:text-lime transition-colors">Devis</Link>
              <Link to="/studio" className="text-sm text-white/50 hover:text-lime transition-colors">Studio IA</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Légal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/mentions-legales" className="text-sm text-white/50 hover:text-lime transition-colors">Mentions légales</Link>
              <Link to="/conditions-utilisation" className="text-sm text-white/50 hover:text-lime transition-colors">Conditions d'utilisation</Link>
              <Link to="/politique-confidentialite" className="text-sm text-white/50 hover:text-lime transition-colors">Confidentialité</Link>
              <Link to="/politique-cookies" className="text-sm text-white/50 hover:text-lime transition-colors">Cookies</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-white/50">
              <a href="mailto:contact@barakellbeni.com" className="hover:text-lime transition-colors">contact@barakellbeni.com</a>
              <a href="https://wa.me/2250799332338" target="_blank" rel="noopener noreferrer" className="hover:text-lime transition-colors">+225 07 99 33 23 38</a>
              <p>Cotonou, Bénin | Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Pelikulart.AI — Barakell Beni Creativity. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
