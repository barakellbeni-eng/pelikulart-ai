import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Créations", to: "/creations" },
  { label: "Formation", to: "/training" },
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
        scrolled ? "bg-black/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-white">
          PELIKULART<span className="text-lime">.AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${
                location.pathname === link.to
                  ? "text-white"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/studio"
            className="px-5 py-2 bg-white text-black rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all"
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
                  className={`text-sm font-medium uppercase tracking-widest py-2 ${
                    location.pathname === link.to
                      ? "text-white"
                      : "text-white/40"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/studio"
                className="text-sm font-medium uppercase tracking-widest py-2 text-lime"
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
