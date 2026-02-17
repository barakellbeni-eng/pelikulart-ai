import { NavLink } from "react-router-dom";
import { Wand2, Grid3X3, CreditCard, UserCircle, Home } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/studio", icon: Wand2, label: "Studio" },
  { to: "/gallery", icon: Grid3X3, label: "Galerie" },
  { to: "/pricing", icon: CreditCard, label: "Recharge" },
  { to: "/profile", icon: UserCircle, label: "Profil" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.06] md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-2 md:py-0 md:justify-end md:gap-1 md:px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/studio"}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
