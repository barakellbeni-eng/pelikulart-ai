import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import pelikulartLogo from "@/assets/pelikulart-logo.jpeg";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Nos Créations', href: '/creations', isHash: false },
    { label: 'Services', href: '/#services', isHash: true },
    { label: 'Formations', href: '/formation', isHash: false },
    { label: 'À Propos', href: '/#about', isHash: true },
    { label: 'FAQ', href: '/#faq', isHash: true },
  ];

  const handleNavClick = async (e: React.MouseEvent, item: typeof menuItems[0]) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (item.isHash) {
      if (location.pathname !== '/') {
        await navigate('/');
        setTimeout(() => {
          const hash = item.href.split('#')[1];
          const element = document.getElementById(hash);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        const hash = item.href.split('#')[1];
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(item.href);
      window.scrollTo(0, 0);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled || isMobileMenuOpen
          ? 'bg-background/90 backdrop-blur-xl border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 z-50"
          >
            <img src={pelikulartLogo} alt="Pelikulart AI" className="w-8 h-8 rounded-lg" />
            <span className="text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors tracking-tighter">
              PELIKULART.AI
              <span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`relative transition-colors duration-300 font-medium group cursor-pointer py-2 ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </a>
              );
            })}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Se connecter
            </Link>
            <Link
              to="/auth"
              className="btn-generate !px-5 !py-2.5 !text-sm !rounded-xl !animate-none"
            >
              Commencer
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground p-2 hover:text-primary transition-colors z-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border z-40 flex flex-col pt-24 pb-10 px-6"
          >
            <div className="flex flex-col space-y-4 items-center justify-center flex-1">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`w-full text-center py-4 font-bold text-xl transition-colors duration-300 ${
                    location.pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </a>
              ))}

              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-generate !px-8 !py-3 !text-base mt-6"
              >
                Commencer
              </Link>
            </div>

            <div className="text-center text-muted-foreground text-xs mt-auto">
              PELIKULART.AI © {new Date().getFullYear()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
