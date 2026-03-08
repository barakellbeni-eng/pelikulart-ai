import { useState, useEffect, useCallback } from "react";
import { X, Download, Calendar, Cpu, Trash2, Loader2, Image as ImageIcon, Film, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSignedUrl, getSignedUrls } from "@/lib/storage";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";

interface GalleryItem {
  id: string;
  tool_type: "image" | "video" | "audio";
  prompt: string;
  model: string;
  result_url: string;
  result_metadata: Record<string, any> | null;
  created_at: string;
  credits_used: number;
  // resolved signed URL for display
  displayUrl?: string;
}

const DELETE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

const Gallery = () => {
  const { user } = useAuth();
  const { selectedProjectId } = useProjects();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "audio">("all");

  const fetchGallery = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }

    let query = supabase
      .from("generation_jobs")
      .select("id, tool_type, prompt, model, result_url, result_metadata, created_at, credits_used")
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (selectedProjectId) {
      query = query.eq("project_id", selectedProjectId);
    }

    const { data, error } = await query;

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Filter out items without result_url
    const validItems = (data as GalleryItem[]).filter((d) => d.result_url);

    // Resolve signed URLs in batch
    const urls = validItems.map((d) => d.result_url);
    const signedUrls = await getSignedUrls(urls);

    const resolved = validItems.map((item, i) => ({
      ...item,
      displayUrl: signedUrls[i],
    }));

    setItems(resolved);
    setLoading(false);
  }, [user, selectedProjectId]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleDelete = async (item: GalleryItem) => {
    if (deleting) return;
    setDeleting(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const resp = await fetch(DELETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: item.id }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur de suppression");
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success("Génération supprimée");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    try {
      const url = item.displayUrl || item.result_url;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const ext = item.tool_type === "video" ? "mp4" : item.tool_type === "audio" ? "mp3" : "png";
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pelikulart-${item.id.slice(0, 8)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const typeIcon = (type: string) => {
    if (type === "video") return <Film className="w-3 h-3" />;
    if (type === "audio") return <Music className="w-3 h-3" />;
    return <ImageIcon className="w-3 h-3" />;
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.tool_type === filter);

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "image", label: "Images" },
    { key: "video", label: "Vidéos" },
    { key: "audio", label: "Audio" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-gradient-gold">Mes Générations</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} créations</p>
          </div>
          <div className="flex gap-1">
            {filterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Aucune génération pour le moment</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card overflow-hidden cursor-pointer group break-inside-avoid relative"
              >
                {/* Delete button — always visible overlay on media */}
                <div className="relative" onClick={() => setSelected(item)}>
                  {item.tool_type === "image" ? (
                    <img
                      src={item.displayUrl}
                      alt={item.prompt}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  ) : item.tool_type === "video" ? (
                    <video
                      src={item.displayUrl}
                      className="w-full"
                      muted
                      playsInline
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                    />
                  ) : (
                    <div className="w-full h-28 bg-muted/30 flex items-center justify-center">
                      <Music className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    disabled={deleting === item.id}
                    className="absolute top-2 right-2 z-10 opacity-60 group-hover:opacity-100 transition-opacity bg-background/70 backdrop-blur-sm hover:bg-destructive text-muted-foreground hover:text-destructive-foreground rounded-full p-1.5"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {typeIcon(item.tool_type)}
                        {item.model}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Détails</h2>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selected.tool_type === "image" ? (
                <img src={selected.displayUrl} alt={selected.prompt} className="w-full rounded-xl" />
              ) : selected.tool_type === "video" ? (
                <video src={selected.displayUrl} controls className="w-full rounded-xl" />
              ) : (
                <audio src={selected.displayUrl} controls className="w-full" />
              )}

              <div className="space-y-3">
                <p className="text-sm text-foreground">{selected.prompt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selected.created_at).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> {selected.model}
                  </span>
                  <span className="flex items-center gap-1">
                    🐚 {selected.credits_used}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selected)}
                    className="btn-generate flex-1 flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                  <button
                    onClick={() => handleDelete(selected)}
                    disabled={deleting === selected.id}
                    className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm"
                  >
                    {deleting === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
