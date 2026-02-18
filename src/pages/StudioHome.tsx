import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Image, Video, Music, Sparkles, ArrowRight } from "lucide-react";
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
  { icon: Image, label: "Image IA", url: "/studio/create?mode=image" },
  { icon: Video, label: "Vidéo IA", url: "/studio/create?mode=video" },
  { icon: Music, label: "Audio IA", url: "/studio/create?mode=audio" },
  { icon: Sparkles, label: "Cauris Boost", url: "/studio/create?boost=true" },
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
      if (data) setRecentCreations(data);
    };
    load();
  }, [user]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Créateur";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[0.25em] uppercase text-primary mb-2 font-body">Bienvenue</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">
            Bonjour, {displayName}
          </h1>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-12"
        >
          <div className="bg-card border border-border rounded-xl flex items-center gap-3 px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
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
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
            />
            <Link
              to={searchQuery.trim() ? `/studio/create?mode=image&prompt=${encodeURIComponent(searchQuery)}` : "/studio/create?mode=image"}
              className="shrink-0 h-9 px-4 rounded-lg bg-primary flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors text-primary-foreground text-sm font-medium font-body"
            >
              Créer
            </Link>
          </div>
        </motion.div>

        {/* Category tabs + Tools */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all font-body ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickTools
              .filter((t) => {
                if (activeCategory === "all") return true;
                if (activeCategory === "image") return t.url.includes("image") || t.url.includes("boost");
                if (activeCategory === "video") return t.url.includes("video");
                if (activeCategory === "audio") return t.url.includes("audio");
                return true;
              })
              .map((tool, i) => (
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                >
                  <Link
                    to={tool.url}
                    className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-300 group"
                  >
                    <tool.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-foreground font-body">{tool.label}</span>
                  </Link>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Recent Creations */}
        {recentCreations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-14"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold">Créations récentes</h2>
              <Link to="/studio/create?mode=image" className="text-xs text-primary hover:underline flex items-center gap-1 font-body">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentCreations.map((creation, i) => (
                <motion.div
                  key={creation.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="group relative"
                >
                  <div className="aspect-square rounded-xl overflow-hidden border border-border">
                    <img
                      src={creation.image_url}
                      alt={creation.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] text-foreground/80 line-clamp-2 font-body">{creation.prompt}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-xl font-semibold mb-5">Commencer à créer</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: Image, title: "Image IA", desc: "Visuels HD en quelques secondes", url: "/studio/create?mode=image" },
              { icon: Video, title: "Vidéo IA", desc: "Séquences cinématiques par IA", url: "/studio/create?mode=video" },
              { icon: Music, title: "Audio IA", desc: "Musique, voix et effets sonores", url: "/studio/create?mode=audio" },
            ].map((item, i) => (
              <Link
                key={item.title}
                to={item.url}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <h3 className="font-display text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudioHome;
