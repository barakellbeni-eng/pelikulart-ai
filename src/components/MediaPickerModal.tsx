import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Upload, Image as ImageIcon, Film, Music, Loader2, Trash2, Calendar, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSignedUrls } from "@/lib/storage";
import { toast } from "sonner";

// ─── Types ───

interface MediaItem {
  id: string;
  source: "generation" | "upload";
  file_type: "image" | "video" | "audio";
  name: string;
  url: string; // r2: prefixed key or raw URL
  displayUrl?: string; // signed URL for display
  created_at: string;
  model?: string;
  prompt?: string;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, item: MediaItem) => void;
  /** Filter media types shown. Defaults to all. */
  accept?: ("image" | "video" | "audio")[];
  title?: string;
}

const UPLOAD_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-media`;
const DELETE_MEDIA_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-media`;
const DELETE_GENERATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

// ─── Helpers ───

function normalizeMediaRef(url: string): string {
  if (!url) return "";
  return url.startsWith("r2:") ? url.slice(3) : url;
}

function groupByDate(items: MediaItem[]): { label: string; items: MediaItem[] }[] {
  const groups = new Map<string, MediaItem[]>();
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  for (const item of items) {
    const d = new Date(item.created_at);
    let label: string;
    if (d.toDateString() === today) label = "Aujourd'hui";
    else if (d.toDateString() === yesterday) label = "Hier";
    else label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// ─── Component ───

export default function MediaPickerModal({ open, onClose, onSelect, accept, title = "Ajouter un média" }: MediaPickerModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<"generations" | "uploads">("generations");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Fetch data
  const fetchItems = useCallback(async () => {
    if (!user || !open) return;
    setLoading(true);
    setSelected(null);

    try {
      if (tab === "generations") {
        // Fetch from both generation_jobs AND legacy generations table
        const [jobsRes, legacyRes] = await Promise.all([
          supabase
            .from("generation_jobs")
            .select("id, tool_type, model, prompt, result_url, created_at")
            .eq("status", "completed")
            .not("result_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(200),
          supabase
            .from("generations")
            .select("id, media_type, prompt, image_url, created_at")
            .order("created_at", { ascending: false })
            .limit(200),
        ]);

        const allItems: MediaItem[] = [];
        const seenIds = new Set<string>();
        const seenRefs = new Set<string>();

        // Map generation_jobs
        if (!jobsRes.error && jobsRes.data) {
          for (const d of jobsRes.data) {
            const ref = normalizeMediaRef(d.result_url || "");
            seenIds.add(d.id);
            if (ref) seenRefs.add(ref);
            allItems.push({
              id: d.id,
              source: "generation" as const,
              file_type: d.tool_type as "image" | "video" | "audio",
              name: (d.prompt || "Génération").slice(0, 60),
              url: d.result_url!,
              created_at: d.created_at,
              model: d.model,
              prompt: d.prompt,
            });
          }
        }

        // Map legacy generations (avoid duplicates by id OR media reference)
        if (!legacyRes.error && legacyRes.data) {
          for (const d of legacyRes.data) {
            const ref = normalizeMediaRef(d.image_url || "");
            if (seenIds.has(d.id) || (ref && seenRefs.has(ref))) continue;
            if (ref) seenRefs.add(ref);
            allItems.push({
              id: d.id,
              source: "generation" as const,
              file_type: (d.media_type || "image") as "image" | "video" | "audio",
              name: (d.prompt || "Génération").slice(0, 60),
              url: d.image_url,
              created_at: d.created_at,
            });
          }
        }

        // Sort by date desc
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Resolve signed URLs
        const urls = allItems.map((item) => item.url);
        const signedUrls = await getSignedUrls(urls);
        for (let i = 0; i < allItems.length; i++) {
          allItems[i].displayUrl = signedUrls[i];
        }

        setItems(allItems);
      } else {
        const { data, error } = await supabase
          .from("user_media")
          .select("id, file_name, file_type, r2_url, r2_key, created_at")
          .order("created_at", { ascending: false })
          .limit(200);

        if (!error && data) {
          const urls = data.map((d: any) => (d.r2_url || `r2:${d.r2_key}`) as string);
          const signedUrls = await getSignedUrls(urls);
          const mapped: MediaItem[] = data.map((d: any, i: number) => ({
            id: d.id,
            source: "upload" as const,
            file_type: d.file_type as "image" | "video" | "audio",
            name: d.file_name,
            url: d.r2_url || `r2:${d.r2_key}`,
            displayUrl: signedUrls[i],
            created_at: d.created_at,
          }));
          setItems(mapped);
        }
      }
    } catch (e) {
      console.error("MediaPicker fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [user, open, tab]);

  useEffect(() => {
    if (open) fetchItems();
  }, [fetchItems, open]);

  // Filter logic
  const acceptSet = accept ? new Set(accept) : null;
  const filtered = items.filter((item) => {
    if (acceptSet && !acceptSet.has(item.file_type)) return false;
    if (typeFilter !== "all" && item.file_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !(item.prompt || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const grouped = groupByDate(filtered);

  // Upload handler
  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      const formData = new FormData();
      formData.append("file", file);

      const resp = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || "Erreur d'upload");
      }

      const data = await resp.json();
      toast.success("Fichier importé !");

      // Switch to uploads tab and refresh
      setTab("uploads");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'import");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // Delete handler (uploads and generations)
  const handleDelete = async (item: MediaItem) => {
    if (deleting) return;
    setDeleting(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");

      if (item.source === "upload") {
        const resp = await fetch(DELETE_MEDIA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ media_id: item.id }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erreur" }));
          throw new Error(err.error || "Erreur de suppression");
        }
      } else {
        // Generation: call delete-generation
        const resp = await fetch(DELETE_GENERATION_URL, {
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
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success("Fichier supprimé");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setDeleting(null);
    }
  };

  const handleConfirm = () => {
    if (!selected) return;
    // Return the permanent R2 URL
    onSelect(selected.url, selected);
    onClose();
  };

  if (!open) return null;

  const typeButtons: { key: typeof typeFilter; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "Tout", icon: null },
    { key: "image", label: "Images", icon: <ImageIcon className="w-3 h-3" /> },
    { key: "video", label: "Vidéos", icon: <Film className="w-3 h-3" /> },
    { key: "audio", label: "Audio", icon: <Music className="w-3 h-3" /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body — 3 columns */}
          <div className="flex flex-1 min-h-0">
            {/* Left — Navigation */}
            <div className="w-48 border-r border-border p-3 flex flex-col gap-1 shrink-0">
              <button
                onClick={() => setTab("generations")}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  tab === "generations"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                Mes générations
              </button>
              <button
                onClick={() => setTab("uploads")}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  tab === "uploads"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                Mes uploads
              </button>
            </div>

            {/* Center — Grid */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-border">
              {/* Search + filters */}
              <div className="px-4 py-3 border-b border-border space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-1">
                  {typeButtons
                    .filter((t) => !acceptSet || t.key === "all" || acceptSet.has(t.key as any))
                    .map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTypeFilter(t.key)}
                        className={`px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                          typeFilter === t.key
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Media grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {tab === "generations" ? "Aucune génération trouvée" : "Aucun fichier importé"}
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div key={group.label} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{group.label}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelected(item)}
                            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                              selected?.id === item.id
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent hover:border-muted-foreground/20"
                            }`}
                          >
                            {/* Selection check */}
                            {selected?.id === item.id && (
                              <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}

                            {/* Delete button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                              disabled={deleting === item.id}
                              className="absolute top-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              {deleting === item.id ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-2.5 h-2.5" />
                              )}
                            </button>

                            {item.file_type === "image" ? (
                              <img
                                src={item.displayUrl}
                                alt={item.name}
                                className="w-full aspect-square object-cover"
                                loading="lazy"
                              />
                            ) : item.file_type === "video" ? (
                              <div className="w-full aspect-square bg-muted/30 flex items-center justify-center relative">
                                <video src={item.displayUrl} className="w-full h-full object-cover" muted playsInline />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Film className="w-6 h-6 text-foreground/50" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-full aspect-square bg-muted/30 flex items-center justify-center">
                                <Music className="w-6 h-6 text-muted-foreground/50" />
                              </div>
                            )}

                            <div className="p-1.5">
                              <p className="text-[10px] text-muted-foreground truncate">{item.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right — Preview / Upload */}
            <div className="w-72 shrink-0 flex flex-col p-4">
              {selected ? (
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-foreground mb-3">Aperçu</h3>
                  <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden mb-3">
                    {selected.file_type === "image" ? (
                      <img src={selected.displayUrl} alt={selected.name} className="max-w-full max-h-full object-contain" />
                    ) : selected.file_type === "video" ? (
                      <video src={selected.displayUrl} controls className="max-w-full max-h-full" />
                    ) : (
                      <audio src={selected.displayUrl} controls className="w-full px-4" />
                    )}
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-foreground font-medium truncate">{selected.name}</p>
                    {selected.model && (
                      <p className="text-[10px] text-muted-foreground">Modèle : {selected.model}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-foreground mb-3">Importer</h3>
                  <div
                    ref={dropRef}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                      dragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      {uploading ? "Import en cours..." : "Dépose un fichier ou importe depuis ton appareil"}
                    </p>
                    {!uploading && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-primary/10 text-primary text-xs rounded-xl hover:bg-primary/20 transition-colors"
                      >
                        Importer un fichier
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`px-5 py-2.5 text-sm rounded-xl font-medium transition-all ${
                selected
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Utiliser ce média
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
