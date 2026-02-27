import { motion } from "framer-motion";
import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#tools" },
  { label: "À Propos", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Mentions Légales", to: "/mentions-legales" },
  { label: "Politique de Confidentialité", to: "/privacy-policy" },
  { label: "Conditions d'Utilisation", to: "/terms-of-use" },
  { label: "Politique des Cookies", to: "/cookie-policy" },
];

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/pelikulart_ai?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/PelikulartAI",
    label: "Facebook",
  },
];

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const PelikulartFooter = () => {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 pt-8 pb-8 md:pt-20 md:pb-10 bg-background">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0">
        <iframe
          src="https://app.videas.fr/embed/media/9fb38584-a858-4758-b0ff-7a3feb61be46/?autoplay=1&muted=1&loop=1&controls=0&showinfo=0&playsinline=1"
          title="Videas Footer Background"
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-[1.5]"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-16">
          {/* Brand */}
          <div className="text-center md:text-left space-y-2 md:space-y-4 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter shadow-black drop-shadow-md block">
                PELIKULART.AI<span className="text-primary">.</span>
              </span>
              <p className="text-white/80 mt-2 md:mt-6 leading-relaxed text-sm drop-shadow-md max-w-sm mx-auto md:mx-0">
                Révolutionner le cinéma africain par l'intelligence artificielle.
              </p>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 md:mb-6 block drop-shadow-md">
                Navigation
              </span>
              <ul className="space-y-1 md:space-y-4 flex flex-col items-center md:items-start">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="text-white/80 hover:text-primary transition-colors duration-300 text-sm drop-shadow-sm font-medium py-1 block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 md:mb-6 block drop-shadow-md">
                Légal
              </span>
              <ul className="space-y-1 md:space-y-4 flex flex-col items-center md:items-start">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-white/80 hover:text-primary transition-colors duration-300 text-sm drop-shadow-sm font-medium py-1 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-primary font-bold uppercase tracking-widest text-sm mb-2 md:mb-6 block drop-shadow-md">
                Contact
              </span>
              <ul className="space-y-2 md:space-y-4 flex flex-col items-center md:items-start text-left">
                <li className="flex items-start gap-3 text-white/80 text-sm group font-medium">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0 hidden md:block" />
                  <span className="drop-shadow-sm">
                    Abidjan, Côte d'Ivoire
                    <br />
                    Cotonou, Bénin
                  </span>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm group font-medium">
                  <Phone size={16} className="text-primary shrink-0 hidden md:block" />
                  <a href="tel:+2250799332338" className="hover:text-primary transition-colors duration-300 drop-shadow-sm">
                    +225 07 99 332 338
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm group font-medium">
                  <Mail size={16} className="text-primary shrink-0 hidden md:block" />
                  <a href="mailto:agence@pelikulart.ai" className="hover:text-primary transition-colors duration-300 drop-shadow-sm">
                    agence@pelikulart.ai
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Social */}
        <div className="flex justify-center md:justify-end mb-8">
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 md:w-10 md:h-10 border border-white/20 flex items-center justify-center text-white hover:border-primary hover:text-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all duration-300 bg-black/40 backdrop-blur-md rounded-md"
                  aria-label={social.label}
                >
                  <Icon size={20} className="md:w-[18px] md:h-[18px]" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-4 md:pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-center md:text-left">
            <p className="text-white/60 text-xs uppercase tracking-wider drop-shadow-md">
              © {new Date().getFullYear()} PELIKULART.AI. Tous droits réservés.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default PelikulartFooter;
