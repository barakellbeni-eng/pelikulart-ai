import { Link } from "react-router-dom";

const PublicFooter = () => {
  return (
    <footer className="py-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[10px] text-white/30 font-mono">
          <Link to="/mentions-legales" className="hover:text-white/60 transition-colors">Mentions légales</Link>
          <Link to="/politique-confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</Link>
          <Link to="/politique-cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
          <Link to="/conditions-utilisation" className="hover:text-white/60 transition-colors">CGU</Link>
        </div>
        <p className="text-[10px] text-white/15 font-mono">© 2026 Pelikulart.AI</p>
      </div>
    </footer>
  );
};

export default PublicFooter;
