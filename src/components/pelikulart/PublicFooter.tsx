import { Link } from "react-router-dom";

const PublicFooter = () => {
  return (
    <footer className="bg-black border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="text-sm font-bold text-white tracking-tight">
            PELIKULART<span className="text-lime">.AI</span>
          </Link>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white/30">
            <Link to="/mentions-legales" className="hover:text-white/60 transition-colors">Mentions légales</Link>
            <Link to="/conditions-utilisation" className="hover:text-white/60 transition-colors">CGU</Link>
            <Link to="/politique-confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</Link>
            <Link to="/politique-cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
          </div>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Pelikulart.AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
