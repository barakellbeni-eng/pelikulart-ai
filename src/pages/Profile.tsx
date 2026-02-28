import { User, Image, Video, LogOut, Shield, Coins, Camera, Settings, HelpCircle, Trash2, KeyRound, Mail, ChevronRight, ExternalLink, X } from "lucide-react";
import TransactionHistory from "@/components/TransactionHistory";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_CAURIS = 500;

type ActivePanel = null | "security" | "settings" | "help";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { balance } = useCauris();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expirée");

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || !data?.success) {
        throw new Error("Échec de la suppression");
      }

      toast.success("Compte supprimé avec succès");
      await signOut();
      navigate("/");
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Un email de réinitialisation a été envoyé !");
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: newDisplayName.trim() })
        .eq("user_id", user.id);
      if (error) throw error;
      setDisplayName(newDisplayName.trim());
      setEditingName(false);
      toast.success("Nom mis à jour !");
    } catch (err: any) {
      toast.error("Erreur : " + err.message);
    }
  };

  const usagePercent = Math.min((balance / MAX_CAURIS) * 100, 100);

  const renderPanel = () => {
    switch (activePanel) {
      case "security":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Sécurité du compte
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="glass p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="w-full glass p-4 rounded-xl flex items-center gap-3 text-sm text-foreground hover:bg-white/[0.05] transition-colors"
              >
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-left">
                  {changingPassword ? "Envoi en cours..." : "Changer le mot de passe"}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full glass p-4 rounded-xl flex items-center gap-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="flex-1 text-left">Supprimer mon compte</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      case "settings":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Paramètres
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="glass p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Nom d'affichage</span>
                  {!editingName && (
                    <button
                      onClick={() => { setEditingName(true); setNewDisplayName(displayName); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Modifier
                    </button>
                  )}
                </div>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="flex-1 bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Votre nom"
                    />
                    <button
                      onClick={handleUpdateDisplayName}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-3 py-2 glass rounded-lg text-sm text-muted-foreground"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{displayName}</p>
                )}
              </div>

              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Photo de profil</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs text-primary hover:underline"
                  >
                    {uploading ? "Upload..." : "Changer"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Max 2 Mo • JPG, PNG, WebP</p>
              </div>
            </div>
          </motion.div>
        );

      case "help":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Centre d'aide
              </h3>
              <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="glass p-4 rounded-xl space-y-2">
                <h4 className="text-sm font-medium text-foreground">🐚 Comment fonctionnent les Cauris ?</h4>
                <p className="text-xs text-muted-foreground">
                  Les Cauris sont votre monnaie de création. Chaque génération d'image ou vidéo consomme des Cauris selon la complexité. Rechargez depuis la page Tarifs.
                </p>
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <h4 className="text-sm font-medium text-foreground">🖼️ Mes générations disparaissent ?</h4>
                <p className="text-xs text-muted-foreground">
                  Non ! Toutes vos créations sont sauvegardées de manière permanente dans votre galerie personnelle.
                </p>
              </div>

              <div className="glass p-4 rounded-xl space-y-2">
                <h4 className="text-sm font-medium text-foreground">💳 Problème de paiement ?</h4>
                <p className="text-xs text-muted-foreground">
                  Si votre paiement a été débité mais les Cauris non crédités, contactez-nous avec votre ID de transaction.
                </p>
              </div>

              <a
                href="mailto:contact@pelikulart.com"
                className="w-full glass p-4 rounded-xl flex items-center gap-3 text-sm text-foreground hover:bg-white/[0.05] transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1">Contacter le support</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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

        {/* Expandable Panels */}
        <AnimatePresence mode="wait">
          {activePanel && renderPanel()}
        </AnimatePresence>

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
            <Coins className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Plan & recharge</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
              {balance} 🐚
            </span>
          </button>

          <button
            onClick={() => setActivePanel(activePanel === "security" ? null : "security")}
            className={`w-full flex items-center gap-3 p-4 text-left text-sm transition-colors ${
              activePanel === "security" ? "text-primary bg-primary/5" : "text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Sécurité du compte</span>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${activePanel === "security" ? "rotate-90" : ""}`} />
          </button>

          <button
            onClick={() => setActivePanel(activePanel === "settings" ? null : "settings")}
            className={`w-full flex items-center gap-3 p-4 text-left text-sm transition-colors ${
              activePanel === "settings" ? "text-primary bg-primary/5" : "text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Paramètres</span>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${activePanel === "settings" ? "rotate-90" : ""}`} />
          </button>

          <button
            onClick={() => setActivePanel(activePanel === "help" ? null : "help")}
            className={`w-full flex items-center gap-3 p-4 text-left text-sm transition-colors ${
              activePanel === "help" ? "text-primary bg-primary/5" : "text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Centre d'aide</span>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${activePanel === "help" ? "rotate-90" : ""}`} />
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Supprimer mon compte
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Cette action est <strong className="text-destructive">irréversible</strong>. Toutes vos données seront supprimées :
              </p>
              <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                <li>Vos générations (images, vidéos)</li>
                <li>Votre solde de Cauris</li>
                <li>Votre historique de transactions</li>
                <li>Votre profil et avatar</li>
              </ul>
              <p className="text-sm">
                Tapez <strong className="text-foreground">SUPPRIMER</strong> pour confirmer :
              </p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full bg-background/50 border border-destructive/30 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass" onClick={() => setDeleteConfirmText("")}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "SUPPRIMER" || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deleting ? "Suppression..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
