import { useState, useEffect } from "react";
import { getSignedUrls } from "@/lib/storage";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Image,
  Video,
  Music,
  Sparkles,
  Wand2,
  Eraser,
  Paintbrush,
  ScanFace,
  Type,
  ArrowRight,
  Play,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { label: "Tout", value: "all" },
  { label: "Image", value: "image", icon: Image },
  { label: "Vidéo", value: "video", icon: Video },
  { label: "Audio", value: "audio", icon: Music },
];

const quickTools = [
  { icon: Image, label: "Générateur d'images", url: "/studio/create?mode=image", color: "from-blue-500/20 to-blue-600/10" },
  { icon: Video, label: "Générateur vidéo", url: "/studio/create?mode=video", color: "from-purple-500/20 to-purple-600/10" },
  { icon: Music, label: "Générateur audio", url: "/studio/create?mode=audio", color: "from-green-500/20 to-green-600/10" },
  { icon: Sparkles, label: "Cauris Boost", url: "/studio/create?boost=true", color: "from-primary/20 to-primary/10" },
];

interface RecentCreation {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

const StudioHome = () => {
  const { user } = useAuth();
  const { balance } = useCauris();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentCreations, setRecentCreations] = useState<RecentCreation[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("generations")
        .select("id, image_url, prompt, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data && data.length > 0) {
        const urls = data.map(d => d.image_url);
        const signedUrls = await getSignedUrls(urls);
        setRecentCreations(data.map((d, i) => ({ ...d, image_url: signedUrls[i] })));
      }
    };
    load();
  }, [user]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Créateur";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero branding */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl glass-card p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Bienvenue, {displayName}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              La plateforme n°1 de création IA en Afrique
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mb-4">
              Générez des images, vidéos et sons avec l'intelligence artificielle. Payez uniquement ce que vous utilisez via <span className="font-semibold text-foreground">Mobile Money</span>, <span className="font-semibold text-foreground">Wave</span> ou <span className="font-semibold text-foreground">MoMo</span> — sans abonnement.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground glass px-3 py-1.5 rounded-full">
                Solde : <span className="font-bold text-primary">{balance} cauris</span>
              </span>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                Recharger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="glass rounded-2xl p-1.5 flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Décrivez ce que vous voulez créer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  window.location.href = `/studio/create?mode=image&prompt=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-2 py-3 outline-none"
            />
            <Link
              to={searchQuery.trim() ? `/studio/create?mode=image&prompt=${encodeURIComponent(searchQuery)}` : "/studio/create?mode=image"}
              className="shrink-0 h-10 px-5 rounded-xl bg-primary flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-primary-foreground text-sm font-medium"
            >
              Créer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* "What would you like to create?" + category tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Que souhaitez-vous créer ?</h2>
          <div className="flex items-center gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick tool shortcuts */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {quickTools
              .filter((t) => {
                if (activeCategory === "all") return true;
                if (activeCategory === "image") return t.url.includes("image") || t.url.includes("tool=") || t.url.includes("boost");
                if (activeCategory === "video") return t.url.includes("video");
                if (activeCategory === "audio") return t.url.includes("audio");
                return true;
              })
              .map((tool, i) => (
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={tool.url}
                    className="flex items-center gap-2.5 px-4 py-2.5 glass rounded-xl hover:bg-white/[0.06] transition-all whitespace-nowrap group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-4 h-4 text-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{tool.label}</span>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Recent Creations */}
        {recentCreations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Créations récentes</h2>
              <Link to="/studio/create?mode=image" className="text-sm text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentCreations.map((creation, i) => (
                <motion.div
                  key={creation.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <div className="aspect-square rounded-xl overflow-hidden glass-card">
                    <img
                      src={creation.image_url}
                      alt={creation.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] text-foreground/80 line-clamp-2">{creation.prompt}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {new Date(creation.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Get Inspired / CTA */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Commencer à créer</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Image, title: "Image IA", desc: "Générez des visuels HD en quelques secondes", url: "/studio/create?mode=image", gradient: "from-blue-600/20 to-violet-600/10" },
              { icon: Video, title: "Vidéo IA", desc: "Créez des vidéos cinématiques avec l'IA", url: "/studio/create?mode=video", gradient: "from-purple-600/20 to-pink-600/10" },
              { icon: Music, title: "Audio IA", desc: "Musique, voix et effets sonores par IA", url: "/studio/create?mode=audio", gradient: "from-green-600/20 to-emerald-600/10" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  to={item.url}
                  className="block glass-card p-6 group hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioHome;
