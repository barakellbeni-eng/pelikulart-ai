import { User, Image, Video, LogOut, Shield, Coins, Camera, Settings, HelpCircle } from "lucide-react";
import TransactionHistory from "@/components/TransactionHistory";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const MAX_CAURIS = 500; // Limit display for progress bar

const Profile = () => {
  const { user, signOut } = useAuth();
  const { balance } = useCauris();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || user.email?.split("@")[0] || "Utilisateur");
      }
    };
    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(url);
      toast.success("Photo de profil mise à jour !");
    } catch (err: any) {
      toast.error("Erreur lors de l'upload : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const usagePercent = Math.min((balance / MAX_CAURIS) * 100, 100);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {/* Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative group">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </motion.div>

        {/* Recharge CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => navigate("/pricing")}
            className="w-full btn-generate flex items-center justify-center gap-2 py-3 text-sm rounded-xl"
          >
            <Coins className="w-4 h-4" />
            Recharger mes Cauris
          </button>
        </motion.div>

        {/* Credit Usage */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Utilisation des Cauris 🐚</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Solde : <span className="text-foreground font-bold">{balance}</span></span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <TransactionHistory />
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card divide-y divide-white/[0.06]"
        >
          <button
            onClick={() => navigate("/pricing")}
            className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-white/[0.03] transition-colors"
          >
            <CreditCardIcon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Plan & recharge</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
              {balance} 🐚
            </span>
          </button>

          <button className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-white/[0.03] transition-colors">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Sécurité du compte</span>
          </button>

          <button className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-white/[0.03] transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Paramètres</span>
          </button>

          <button className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-white/[0.03] transition-colors">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Centre d'aide</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 text-left text-sm text-destructive hover:bg-white/[0.03] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1">Déconnexion</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

// Simple credit card icon inline to avoid extra import
const CreditCardIcon = ({ className }: { className?: string }) => (
  <Coins className={className} />
);

export default Profile;
