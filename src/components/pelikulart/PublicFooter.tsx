import { Link } from "react-router-dom";

const PublicFooter = () => {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-sm font-bold text-white tracking-tight font-display">
            Pelikulart<span className="text-lime">.AI</span>
          </Link>

          <nav className="flex items-center gap-6 text-xs text-white/40 font-label">
            <Link to="/creations" className="hover:text-white transition-colors">Créations</Link>
            <Link to="/formation" className="hover:text-white transition-colors">Formation</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/devis" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          <nav className="flex items-center gap-4 text-[10px] text-white/30 font-mono">
            <Link to="/mentions-legales" className="hover:text-white/60 transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link to="/politique-cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
            <Link to="/conditions-utilisation" className="hover:text-white/60 transition-colors">CGU</Link>
          </nav>

          <p className="text-xs text-white/20 font-mono">
            © 2026 Pelikulart.AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
