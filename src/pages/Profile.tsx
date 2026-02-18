import { Coins, LogOut, Shield, Camera, Settings, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const MAX_CAURIS = 500;

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
    if (!file.type.startsWith("image/")) { toast.error("Veuillez sélectionner une image"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setAvatarUrl(url);
      toast.success("Photo de profil mise à jour !");
    } catch (err: any) {
      toast.error("Erreur lors de l'upload : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const usagePercent = Math.min((balance / MAX_CAURIS) * 100, 100);

  const menuItems = [
    { icon: Coins, label: "Plan & recharge", onClick: () => navigate("/pricing"), badge: `${balance} cauris` },
    { icon: Shield, label: "Sécurité du compte" },
    { icon: Settings, label: "Paramètres" },
    { icon: HelpCircle, label: "Centre d'aide" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <main className="max-w-lg mx-auto px-6 pt-12 space-y-8">
        {/* Avatar & Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="w-16 h-16 border-2 border-border">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-display font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground font-body">{user?.email}</p>
          </div>
        </motion.div>

        {/* Recharge CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => navigate("/pricing")}
            className="w-full btn-generate flex items-center justify-center gap-2 py-3 text-sm"
          >
            Recharger mes cauris
          </button>
        </motion.div>

        {/* Credit Usage */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Utilisation des cauris</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground font-body">
            <span>Solde : <span className="text-foreground font-semibold">{balance}</span></span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl divide-y divide-border"
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 p-4 text-left text-sm text-foreground hover:bg-secondary/50 transition-colors font-body"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 text-left text-sm text-destructive hover:bg-destructive/5 transition-colors font-body"
          >
            <LogOut className="w-4 h-4" />
            <span className="flex-1">Déconnexion</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
