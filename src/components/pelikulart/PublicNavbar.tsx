import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Créations", to: "/creations" },
  { label: "Formation", to: "/training" },
  { label: "Tarifs", to: "/#pricing" },
  { label: "Connexion", to: "/auth" },
];

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#080808]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-white">
          Pelikulart <span className="text-lime">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] font-label font-medium uppercase tracking-widest transition-colors px-4 py-2 rounded-pill ${
                location.pathname === link.to
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/studio"
            className="px-5 py-2 bg-lime text-white rounded-pill text-[13px] font-label font-semibold hover:bg-lime/90 transition-all glow-accent"
          >
            Essayer notre studio
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white p-2"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-label font-medium uppercase tracking-widest py-2 ${
                    location.pathname === link.to
                      ? "text-white"
                      : "text-white/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/studio"
                className="text-sm font-label font-medium uppercase tracking-widest py-2 text-lime"
              >
                Essayer notre studio
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PublicNavbar;
