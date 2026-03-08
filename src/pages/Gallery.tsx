import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, Download, Calendar, Cpu, Trash2, Loader2, Image as ImageIcon, Film, Music, Check, ClipboardCopy, Play, Pause, RotateCcw } from "lucide-react";
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
  result_url_original?: string | null;
  result_metadata: Record<string, any> | null;
  created_at: string;
  credits_used: number;
  project_id?: string | null;
  displayUrl?: string;
}

const DELETE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-generation`;

// Audio player state for gallery cards
const audioRefs: Record<string, HTMLAudioElement> = {};

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
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const { prefs, update } = useGalleryPreferences();

  // --- Filtering & Sorting ---
  const filtered = useMemo(() => {
    let list = [...items];

    // Type filter
    if (prefs.typeFilter !== "all") {
      list = list.filter((i) => i.tool_type === prefs.typeFilter);
    }

    // Source filter (multi-plan vs standard)
    if (prefs.sourceFilter === "multiplan") {
      list = list.filter((i) => i.prompt.startsWith("Multi-Plan"));
    } else if (prefs.sourceFilter === "standard") {
      list = list.filter((i) => !i.prompt.startsWith("Multi-Plan"));
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
  }, [items, prefs.typeFilter, prefs.sourceFilter, prefs.dateFilter, prefs.sortBy]);

  const {
    selectedIds,
    containerRef,
    toggleSelect,
    clearSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    dragBox,
    isSelected,
    selectionCount,
  } = useGallerySelection(filtered.map((i) => i.id));

  const fetchGallery = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }

    let query = supabase
      .from("generation_jobs")
      .select("*")
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (selectedProjectId) query = query.eq("project_id", selectedProjectId);

    const { data, error } = await query;
    if (error || !data) { setLoading(false); return; }

    const validItems: GalleryItem[] = (data as any[])
      .filter((d: any) => d.result_url)
      .map((d: any) => ({
        id: d.id,
        tool_type: d.tool_type,
        prompt: d.prompt,
        model: d.model,
        result_url: d.result_url,
        result_url_original: d.result_url_original || d.result_url,
        result_metadata: d.result_metadata,
        created_at: d.created_at,
        credits_used: d.credits_used,
        project_id: d.project_id,
      }));
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
      const url = item.result_url_original || item.displayUrl || item.result_url;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const ext = item.tool_type === "video" ? "mp4" : item.tool_type === "audio" ? "mp3" : "png";
      const date = new Date(item.created_at).toISOString().slice(0, 10).replace(/-/g, '');
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `pelikulart_${item.tool_type}_${date}_${item.id.slice(0, 8)}.${ext}`;
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

  const toggleAudioPlay = useCallback((itemId: string, url: string) => {
    if (playingAudioId === itemId) {
      audioRefs[itemId]?.pause();
      setPlayingAudioId(null);
      return;
    }
    // Stop any other playing audio
    if (playingAudioId && audioRefs[playingAudioId]) {
      audioRefs[playingAudioId].pause();
    }
    if (!audioRefs[itemId]) {
      audioRefs[itemId] = new Audio(url);
      audioRefs[itemId].onended = () => setPlayingAudioId(null);
    }
    audioRefs[itemId].play();
    setPlayingAudioId(itemId);
  }, [playingAudioId]);

  const typeIcon = (type: string) => {
    if (type === "video") return <Film className="w-3 h-3" />;
    if (type === "audio") return <Music className="w-3 h-3" />;
    return <ImageIcon className="w-3 h-3" />;
  };

  const typeTag = (type: string) => {
    if (type === "video") return <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-medium">Vidéo</span>;
    if (type === "audio") return <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Audio</span>;
    return <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">Image</span>;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const wasDraggingRef = useRef(false);

  const handleContainerMouseUp = useCallback(() => {
    wasDraggingRef.current = handleMouseUp();
  }, [handleMouseUp]);

  const handleCardClick = (item: GalleryItem, e: React.MouseEvent) => {
    // Ignore click if we just finished a drag-select
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    if (e.ctrlKey || e.metaKey || selectionCount > 0) {
      toggleSelect(item.id, e.ctrlKey || e.metaKey);
    } else {
      setSelected(item);
    }
  };

  // --- Grid style based on zoom (5 levels) ---
  const gridStyle = useMemo(() => {
    const val = prefs.zoom;
    const sizes = [80, 130, 180, 240, 0]; // 0 = full width
    const size = sizes[val - 1];
    if (val === 5) return { gridTemplateColumns: "1fr" };
    if (val === 4) return { gridTemplateColumns: "repeat(2, 1fr)" };
    return { gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))` };
  }, [prefs.zoom]);

  const cardAspect = prefs.zoom >= 4 ? "aspect-video" : "aspect-square";

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
        onMouseUp={handleContainerMouseUp}
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
          <div className="grid gap-3" style={gridStyle}>
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
                    className={`glass-card overflow-hidden cursor-pointer group relative transition-all duration-200 ${isSelected(item.id) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                    onClick={(e) => handleCardClick(item, e)}
                  >
                    {/* Selection checkbox — visible on hover OR when any selection exists */}
                    <div
                      className={`absolute top-2 left-2 z-20 transition-opacity duration-150 ${
                        selectionCount > 0 || isSelected(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(item.id, true); }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg transition-all duration-150 ${
                          isSelected(item.id)
                            ? "bg-primary text-primary-foreground scale-110"
                            : "bg-background/60 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                        }`}
                      >
                        {isSelected(item.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-current" />
                        )}
                      </button>
                    </div>

                    {/* Media */}
                    <div className="relative">
                      {item.tool_type === "image" ? (
                        <img
                          src={item.displayUrl}
                          alt={item.prompt}
                          className={`w-full ${cardAspect} object-cover`}
                          loading="lazy"
                        />
                      ) : item.tool_type === "video" ? (
                        <div className="relative aspect-square bg-card flex items-center justify-center overflow-hidden">
                          <VideoThumbnail src={item.displayUrl || ""} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                              <Play className="w-3 h-3 text-primary ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                          {item.result_metadata?.duration && (
                            <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                              {Math.floor(item.result_metadata.duration / 60)}:{Math.floor(item.result_metadata.duration % 60).toString().padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      ) : item.tool_type === "audio" ? (
                        <div
                          className={`w-full aspect-square bg-gradient-to-br from-card to-muted/30 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden cursor-pointer ${playingAudioId === item.id ? "audio-playing" : ""}`}
                          onClick={(e) => { e.stopPropagation(); toggleAudioPlay(item.id, item.displayUrl || item.result_url); }}
                        >
                          {/* Ripple icon */}
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary relative z-10" />
                            {playingAudioId === item.id && (
                              <>
                                <div className="ripple-ring absolute inset-0 rounded-full border-[1.5px] border-primary/30" />
                                <div className="ripple-ring-delayed absolute -inset-2 rounded-full border-[1.5px] border-primary/30" />
                              </>
                            )}
                          </div>

                          {/* Waveform bars */}
                          <div className="flex items-center gap-[3px] h-5">
                            {[6, 14, 10, 18, 8, 16, 12, 6].map((h, idx) => (
                              <div
                                key={idx}
                                className="wave-bar w-[3px] rounded-sm bg-primary/20"
                                style={{ height: `${h}px`, animationDelay: `${idx * 0.1}s` }}
                              />
                            ))}
                          </div>

                          {/* Play button */}
                          <button
                            className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-transform hover:scale-110"
                            onClick={(e) => { e.stopPropagation(); toggleAudioPlay(item.id, item.displayUrl || item.result_url); }}
                          >
                            {playingAudioId === item.id ? (
                              <Pause className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" />
                            ) : (
                              <Play className="w-2.5 h-2.5 text-primary-foreground ml-0.5" fill="currentColor" />
                            )}
                          </button>

                          {item.result_metadata?.duration && (
                            <span className="absolute bottom-2.5 right-2.5 text-[10px] text-muted-foreground">
                              {Math.floor(item.result_metadata.duration / 60)}:{Math.floor(item.result_metadata.duration % 60).toString().padStart(2, "0")}
                            </span>
                          )}
                        </div>
                      ) : null}

                      {/* Hover actions: Download, Recreate, Delete */}
                      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                          className="w-[26px] h-[26px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground shadow-sm"
                          title="Télécharger"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.prompt); toast.success("Prompt copié pour recréer !"); }}
                          className="w-[26px] h-[26px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground shadow-sm"
                          title="Recréer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                          className="w-[26px] h-[26px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all text-foreground shadow-sm"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom info bar */}
                    <div className="px-2.5 py-2 flex items-center justify-between border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">{timeAgo(item.created_at)}</span>
                      {typeTag(item.tool_type)}
                    </div>
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
                <div className="space-y-3">
                  <div className="w-full aspect-square bg-muted/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <Music className="w-16 h-16 text-primary/30 mb-3" />
                    <p className="text-xs text-muted-foreground text-center px-6 line-clamp-3">{selected.prompt}</p>
                    {selected.result_metadata?.duration && (
                      <span className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-muted/40 rounded-full px-2.5 py-1">
                        {Math.floor(selected.result_metadata.duration / 60).toString().padStart(2, "0")}:{Math.floor(selected.result_metadata.duration % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <audio src={selected.displayUrl} controls className="w-full" />
                </div>
              )}
              <div className="space-y-3">
                <p className="text-sm text-foreground">{selected.prompt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selected.created_at).toLocaleDateString("fr-FR")}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {selected.model}</span>
                  <span className="flex items-center gap-1">🐚 {selected.credits_used}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(selected.prompt); toast.success("Prompt copié !"); }} className="px-4 py-3 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 transition-colors text-sm" title="Copier le prompt">
                    <ClipboardCopy className="w-4 h-4" />
                  </button>
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
