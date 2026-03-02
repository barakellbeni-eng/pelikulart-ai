import { Link } from "react-router-dom";

const PublicFooter = () => {
  return (
    <footer className="w-full bg-[#FF6200] text-black pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6 mb-16">
          {/* Tagline */}
          <div className="md:col-span-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase leading-[0.95] tracking-tight font-display">
              Le cinéma
              <br />
              africain
              <br />
              propulsé
              <br />
              par l'IA
            </h2>
          </div>

          {/* Pelikulart AI */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-60">Pelikulart AI</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link to="/" className="hover:underline">Accueil</Link></li>
              <li><Link to="/creations" className="hover:underline">Créations</Link></li>
              <li><Link to="/training" className="hover:underline">Formations</Link></li>
              <li><Link to="/pricing" className="hover:underline">Tarifs</Link></li>
              <li><Link to="/auth" className="hover:underline">Studio</Link></li>
            </ul>
          </div>

          {/* Image */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-60">Image</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>Nano Banana Pro</li>
              <li>Imagen 4 Ultra</li>
              <li>FLUX Kontext Max</li>
              <li>Seedream v4.5</li>
              <li>Ideogram</li>
              <li>Pelikulart Studio</li>
            </ul>
          </div>

          {/* Vidéo */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-60">Vidéo</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>Kling 2.1 Master</li>
              <li>Kling 2.5</li>
              <li>Kling 2.6</li>
              <li>Kling 3.0</li>
              <li>Veo 3</li>
            </ul>
          </div>

          {/* Formation */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-4 opacity-60">Formation</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>Starter</li>
              <li>Pro IA</li>
              <li>Elite Coaching</li>
              <li>Clip Musical IA</li>
              <li>Direction Artistique</li>
              <li>Prompt Engineering</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[11px] font-medium opacity-70">
            <Link to="/mentions-legales" className="hover:underline">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:underline">Confidentialité</Link>
            <Link to="/politique-cookies" className="hover:underline">Cookies</Link>
            <Link to="/conditions-utilisation" className="hover:underline">CGU</Link>
          </div>
          <p className="text-[11px] font-medium opacity-50">© 2026 Pelikulart.AI — Forme-toi, crée, gagne du temps.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
