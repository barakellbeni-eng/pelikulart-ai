import { User, Zap, Image, Video, LogOut, Shield, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { balance } = useCauris();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">
            <span className="text-gradient-gold">Profil</span>
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{user?.email?.split("@")[0] ?? "Utilisateur"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Coins, label: "Cauris 🐚", value: String(balance), color: "text-primary" },
            { icon: Image, label: "Images créées", value: "0", color: "text-accent" },
            { icon: Video, label: "Vidéos créées", value: "0", color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 space-y-2"
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recharge CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate("/pricing")}
            className="w-full btn-generate flex items-center justify-center gap-2 py-3 text-sm"
          >
            <Coins className="w-4 h-4" />
            Recharger mes Cauris
          </button>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card divide-y divide-white/[0.06]"
        >
          <button className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-white/[0.03] transition-colors">
            <Shield className="w-4 h-4 text-muted-foreground" />
            Sécurité du compte
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 text-left text-sm text-destructive hover:bg-white/[0.03] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
