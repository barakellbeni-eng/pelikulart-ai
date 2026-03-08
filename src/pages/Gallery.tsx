import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Download, Calendar, Cpu, Trash2, Loader2, Image as ImageIcon, Film, Music, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSignedUrls } from "@/lib/storage";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";
import VideoThumbnail from "@/components/VideoThumbnail";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import GalleryCardMenu from "@/components/GalleryCardMenu";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useGalleryPreferences } from "@/hooks/useGalleryPreferences";
import GalleryToolbar from "@/components/GalleryToolbar";

interface GalleryItem {
  id: string;
  tool_type: "image" | "video" | "audio";
  prompt: string;
  model: string;
  result_url: string;
  result_metadata: Record<string, any> | null;
  created_at: string;
  credits_used: number;
  project_id?: string | null;
  displayUrl?: string;
}

const DELETE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

const Gallery = () => {
  const { user } = useAuth();
  const { selectedProjectId, projects } = useProjects();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const { prefs, update } = useGalleryPreferences();

  // --- Filtering & Sorting ---
  const filtered = useMemo(() => {
    let list = [...items];

    // Type filter
    if (prefs.typeFilter !== "all") {
      list = list.filter((i) => i.tool_type === prefs.typeFilter);
    }

    // Date filter
    if (prefs.dateFilter !== "all") {
      const now = new Date();
      const start = new Date();
      if (prefs.dateFilter === "today") start.setHours(0, 0, 0, 0);
      else if (prefs.dateFilter === "week") start.setDate(now.getDate() - 7);
      else if (prefs.dateFilter === "month") start.setMonth(now.getMonth() - 1);
      list = list.filter((i) => new Date(i.created_at) >= start);
    }

    // Sort
    if (prefs.sortBy === "newest") list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (prefs.sortBy === "oldest") list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    else if (prefs.sortBy === "type") list.sort((a, b) => a.tool_type.localeCompare(b.tool_type));
    else if (prefs.sortBy === "model") list.sort((a, b) => a.model.localeCompare(b.model));

    return list;
  }, [items, prefs.typeFilter, prefs.dateFilter, prefs.sortBy]);

  const {
    selectedIds,
    containerRef,
    toggleSelect,
    clearSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    dragBox,
    isSelected,
    selectionCount,
  } = useGallerySelection(filtered.map((i) => i.id));

  const fetchGallery = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }

    let query = supabase
      .from("generation_jobs")
      .select("id, tool_type, prompt, model, result_url, result_metadata, created_at, credits_used, project_id")
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (selectedProjectId) query = query.eq("project_id", selectedProjectId);

    const { data, error } = await query;
    if (error || !data) { setLoading(false); return; }

    const validItems = (data as GalleryItem[]).filter((d) => d.result_url);
    const urls = validItems.map((d) => d.result_url);
    const signedUrls = await getSignedUrls(urls);

    setItems(validItems.map((item, i) => ({ ...item, displayUrl: signedUrls[i] })));
    setLoading(false);
  }, [user, selectedProjectId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  // --- Delete handlers (unchanged logic) ---
  const handleDelete = async (item: GalleryItem) => {
    if (deleting) return;
    setDeleting(item.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");
      const resp = await fetch(DELETE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: item.id }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erreur" })); throw new Error(err.error || "Erreur de suppression"); }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (selected?.id === item.id) setSelected(null);
      toast.success("Génération supprimée");
    } catch (e: any) { toast.error(e.message || "Erreur lors de la suppression"); }
    finally { setDeleting(null); setDeleteTarget(null); }
  };

  const handleBatchDelete = async () => {
    if (batchDeleting || selectionCount === 0) return;
    setBatchDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Non authentifié");
      const idsToDelete = Array.from(selectedIds);
      setRemovingIds(new Set(idsToDelete));
      await new Promise((r) => setTimeout(r, 300 + idsToDelete.length * 50));
      const results = await Promise.allSettled(
        idsToDelete.map((id) =>
          fetch(DELETE_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ job_id: id }) })
        )
      );
      const successIds = new Set<string>();
      results.forEach((r, i) => { if (r.status === "fulfilled" && r.value.ok) successIds.add(idsToDelete[i]); });
      setItems((prev) => prev.filter((i) => !successIds.has(i.id)));
      clearSelection();
      setRemovingIds(new Set());
      if (successIds.size === idsToDelete.length) toast.success(`${successIds.size} génération(s) supprimée(s)`);
      else toast.warning(`${successIds.size}/${idsToDelete.length} supprimée(s)`);
    } catch (e: any) { toast.error(e.message || "Erreur lors de la suppression"); setRemovingIds(new Set()); }
    finally { setBatchDeleting(false); }
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
    } catch { toast.error("Erreur lors du téléchargement"); }
  };

  const handleMoveToProject = async (item: GalleryItem, projectId: string | null) => {
    const { error } = await supabase.from("generation_jobs").update({ project_id: projectId }).eq("id", item.id);
    if (error) { toast.error("Erreur lors du déplacement"); return; }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, project_id: projectId } : i)));
    const projectName = projectId ? projects.find((p) => p.id === projectId)?.name || "projet" : "aucun projet";
    toast.success(`Déplacé vers ${projectName}`);
  };

  const typeIcon = (type: string) => {
    if (type === "video") return <Film className="w-3 h-3" />;
    if (type === "audio") return <Music className="w-3 h-3" />;
    return <ImageIcon className="w-3 h-3" />;
  };

  const handleCardClick = (item: GalleryItem, e: React.MouseEvent) => {
    if (isDragging) return;
    if (e.ctrlKey || e.metaKey || selectionCount > 0) {
      toggleSelect(item.id, e.ctrlKey || e.metaKey);
    } else {
      setSelected(item);
    }
  };

  // --- Grid classes based on zoom level & view type ---
  const zoomColumns: Record<number, { masonry: string; grid: string }> = {
    1: { masonry: "columns-4 md:columns-5 lg:columns-6 gap-1.5 space-y-1.5", grid: "grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5" },
    2: { masonry: "columns-3 md:columns-4 lg:columns-5 gap-2 space-y-2", grid: "grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2" },
    3: { masonry: "columns-2 md:columns-3 gap-3 space-y-3", grid: "grid grid-cols-2 md:grid-cols-3 gap-3" },
    4: { masonry: "columns-2 md:columns-2 gap-4 space-y-4", grid: "grid grid-cols-2 md:grid-cols-2 gap-4" },
    5: { masonry: "columns-1 md:columns-2 gap-4 space-y-4", grid: "grid grid-cols-1 md:grid-cols-2 gap-4" },
  };
  const gridClass = useMemo(() => {
    const z = zoomColumns[prefs.zoom] || zoomColumns[3];
    return prefs.viewType === "masonry" ? z.masonry : z.grid;
  }, [prefs.zoom, prefs.viewType]);

  const isGrid = prefs.viewType === "grid";

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-gradient-gold">Mes Générations</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} créations</p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[57px] z-40">
        <div className="max-w-5xl mx-auto">
          <GalleryToolbar prefs={prefs} update={update} />
        </div>
      </div>

      {/* Main content */}
      <main
        ref={containerRef}
        className="max-w-5xl mx-auto px-4 pt-6 relative select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {dragBox && (
          <div
            className="absolute border-2 border-primary/50 bg-primary/10 rounded-sm pointer-events-none z-40"
            style={{ left: dragBox.x, top: dragBox.y, width: dragBox.w, height: dragBox.h }}
          />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">Aucune génération pour le moment</p>
          </div>
        ) : (
          <div className={gridClass}>
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const removing = removingIds.has(item.id);
                const removingIndex = removing ? Array.from(removingIds).indexOf(item.id) : 0;

                return (
                  <motion.div
                    key={item.id}
                    data-gallery-card={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      removing
                        ? { opacity: 0, scale: 0.85, transition: { delay: removingIndex * 0.05, duration: 0.3, ease: "easeOut" } }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.3, ease: "easeOut" } }}
                    transition={{ delay: i * 0.03, layout: { duration: 0.4, ease: "easeInOut" } }}
                    className={`glass-card overflow-hidden cursor-pointer group relative transition-all duration-200 ${
                      isGrid ? "break-inside-auto" : "break-inside-avoid"
                    } ${isSelected(item.id) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                    onClick={(e) => handleCardClick(item, e)}
                  >
                    {/* Selection checkmark */}
                    <AnimatePresence>
                      {isSelected(item.id) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Media */}
                    <div className="relative">
                      {item.tool_type === "image" ? (
                        <img
                          src={item.displayUrl}
                          alt={item.prompt}
                          className={`w-full object-cover ${isGrid ? "aspect-square" : ""}`}
                          loading="lazy"
                        />
                      ) : item.tool_type === "video" ? (
                        <div className="relative">
                          <VideoThumbnail src={item.displayUrl || ""} />
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-muted/30 flex items-center justify-center">
                          <Music className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-destructive/80 backdrop-blur-sm hover:bg-destructive transition-all text-destructive-foreground shadow-sm"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <GalleryCardMenu
                          onDownload={() => handleDownload(item)}
                          onDelete={() => setDeleteTarget(item)}
                          onMoveProject={() => {
                            const otherProjects = projects.filter((p) => p.id !== item.project_id);
                            if (otherProjects.length === 0) { toast.info("Aucun autre projet disponible"); return; }
                            handleMoveToProject(item, otherProjects[0].id);
                          }}
                        />
                      </div>
                    </div>

                    {/* Info (conditionally shown) */}
                    {(prefs.showPrompt || prefs.showMeta) && (
                      <div className="p-3">
                        {prefs.showPrompt && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.prompt}</p>
                        )}
                        {prefs.showMeta && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              {typeIcon(item.tool_type)}
                              {item.model}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              🐚 {item.credits_used}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Floating selection bar */}
      <AnimatePresence>
        {selectionCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-xl"
          >
            <span className="text-sm font-medium text-foreground">
              {selectionCount} élément{selectionCount > 1 ? "s" : ""} sélectionné{selectionCount > 1 ? "s" : ""}
            </span>
            <div className="w-px h-5 bg-border" />
            <button onClick={clearSelection} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              className="px-4 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2"
            >
              {batchDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Supprimer la sélection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selected.created_at).toLocaleDateString("fr-FR")}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {selected.model}</span>
                  <span className="flex items-center gap-1">🐚 {selected.credits_used}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(selected)} className="btn-generate flex-1 flex items-center justify-center gap-2 text-sm py-3">
                    <Download className="w-4 h-4" /> Télécharger
                  </button>
                  <button onClick={() => setDeleteTarget(selected)} className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        open={!!deleteTarget}
        loading={!!deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
};

export default Gallery;
