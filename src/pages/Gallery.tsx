import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { X, Download, Calendar, Cpu, Trash2, Loader2, Image as ImageIcon, Film, Music, Check, ClipboardCopy, Play, Pause, RotateCcw, FolderOpen, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSignedUrls } from "@/lib/storage";
import { toast } from "sonner";
import { useProjects } from "@/hooks/useProjects";
import VideoThumbnail from "@/components/VideoThumbnail";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useGalleryPreferences } from "@/hooks/useGalleryPreferences";

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
const audioRefs: Record<string, HTMLAudioElement> = {};

// Zoom level config
const ZOOM_LABELS = ["Mini", "Petit", "Moyen", "2×16:9", "1×16:9"] as const;

const Gallery = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [searchParams] = useSearchParams();

  // Read project & type from URL
  const urlProjectId = searchParams.get("project") || null;
  const urlType = searchParams.get("type") as "image" | "video" | "audio" | null;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "image" | "video" | "audio">(urlType || "all");

  const { prefs, update } = useGalleryPreferences();

  const activeProject = urlProjectId ? projects.find((p) => p.id === urlProjectId) : null;

  // --- Filtering & Sorting ---
  const filtered = useMemo(() => {
    let list = [...items];

    // Tab filter (takes priority over URL type)
    if (activeTab !== "all") {
      list = list.filter((i) => i.tool_type === activeTab);
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

    // Sort — default: newest
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [items, activeTab, prefs.sourceFilter, prefs.dateFilter]);

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
    setLoading(true);

    let query = supabase
      .from("generation_jobs")
      .select("*")
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (urlProjectId) query = query.eq("project_id", urlProjectId);

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
  }, [user, urlProjectId]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  // Sync tab from URL on mount
  useEffect(() => {
    if (urlType) setActiveTab(urlType);
  }, [urlType]);

  // Count per type
  const counts = useMemo(() => ({
    all: items.length,
    image: items.filter((i) => i.tool_type === "image").length,
    video: items.filter((i) => i.tool_type === "video").length,
    audio: items.filter((i) => i.tool_type === "audio").length,
  }), [items]);

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
    if (playingAudioId && audioRefs[playingAudioId]) audioRefs[playingAudioId].pause();
    if (!audioRefs[itemId]) {
      audioRefs[itemId] = new Audio(url);
      audioRefs[itemId].onended = () => setPlayingAudioId(null);
    }
    audioRefs[itemId].play();
    setPlayingAudioId(itemId);
  }, [playingAudioId]);

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
    if (wasDraggingRef.current) { wasDraggingRef.current = false; return; }
    if (e.ctrlKey || e.metaKey || selectionCount > 0) {
      toggleSelect(item.id, e.ctrlKey || e.metaKey);
    } else {
      setSelected(item);
    }
  };

  // --- 5 zoom levels ---
  // 1=Mini, 2=Petit, 3=Moyen, 4=2×16:9, 5=1×16:9
  const gridStyle = useMemo(() => {
    const val = prefs.zoom;
    if (val === 5) return { gridTemplateColumns: "1fr" };
    if (val === 4) return { gridTemplateColumns: "repeat(2, 1fr)" };
    const sizes = [72, 120, 200];
    const size = sizes[val - 1];
    return { gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))` };
  }, [prefs.zoom]);

  const cardAspect = prefs.zoom >= 4 ? "aspect-video" : "aspect-square";

  const TABS = [
    { key: "all" as const, label: "Tout", count: counts.all },
    { key: "image" as const, label: "Images", count: counts.image, icon: <ImageIcon className="w-3 h-3" /> },
    { key: "video" as const, label: "Vidéos", count: counts.video, icon: <Film className="w-3 h-3" /> },
    { key: "audio" as const, label: "Audios", count: counts.audio, icon: <Music className="w-3 h-3" /> },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 glass border-b border-white/[0.06] px-5 pt-4 pb-0">
        {/* Title row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                {activeProject ? activeProject.name : "Toutes les créations"}
              </h1>
              {activeProject && (
                <p className="text-[11px] text-muted-foreground">
                  {activeProject.generation_count} gén. · {activeProject.cauris_spent} cauris
                </p>
              )}
            </div>
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-2 pb-1">
            <button onClick={() => update("zoom", Math.max(1, prefs.zoom - 1))} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground w-14 text-center font-medium">{ZOOM_LABELS[prefs.zoom - 1]}</span>
            <button onClick={() => update("zoom", Math.min(5, prefs.zoom + 1))} className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors relative ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                activeTab === tab.key ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Scrollable grid */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-24 relative select-none"
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
          <div className="grid gap-2" style={gridStyle}>
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const removing = removingIds.has(item.id);
                const removingIndex = removing ? Array.from(removingIds).indexOf(item.id) : 0;
                return (
                  <motion.div
                    key={item.id}
                    data-gallery-card={item.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={
                      removing
                        ? { opacity: 0, scale: 0.85, transition: { delay: removingIndex * 0.05, duration: 0.3 } }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.3 } }}
                    transition={{ delay: i * 0.02, layout: { duration: 0.3 } }}
                    className={`glass-card overflow-hidden cursor-pointer group relative transition-all duration-200 ${isSelected(item.id) ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                    onClick={(e) => handleCardClick(item, e)}
                  >
                    {/* Selection checkbox */}
                    <div className={`absolute top-2 left-2 z-20 transition-opacity duration-150 ${selectionCount > 0 || isSelected(item.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(item.id, true); }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-sm shadow-lg transition-all duration-150 ${isSelected(item.id) ? "bg-primary text-primary-foreground scale-110" : "bg-background/60 text-muted-foreground hover:bg-background/80"}`}
                      >
                        {isSelected(item.id) ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded border-2 border-current" />}
                      </button>
                    </div>

                    {/* Media */}
                    <div className="relative">
                      {item.tool_type === "image" ? (
                        <img src={item.displayUrl} alt={item.prompt} className={`w-full ${cardAspect} object-cover`} loading="lazy" />
                      ) : item.tool_type === "video" ? (
                        <div className={`relative ${cardAspect} bg-card flex items-center justify-center overflow-hidden`}>
                          <VideoThumbnail src={item.displayUrl || ""} />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                              <Play className="w-3 h-3 text-primary ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : item.tool_type === "audio" ? (
                        <div
                          className={`w-full ${cardAspect} bg-gradient-to-br from-card to-muted/30 flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer`}
                          onClick={(e) => { e.stopPropagation(); toggleAudioPlay(item.id, item.displayUrl || item.result_url); }}
                        >
                          <Music className="w-5 h-5 text-primary relative z-10" />
                          <div className="flex items-center gap-[2px] h-4">
                            {[6, 14, 10, 18, 8, 16, 12, 6].map((h, idx) => (
                              <div key={idx} className="wave-bar w-[3px] rounded-sm bg-primary/20" style={{ height: `${h}px`, animationDelay: `${idx * 0.1}s` }} />
                            ))}
                          </div>
                          <button className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            {playingAudioId === item.id ? <Pause className="w-2 h-2 text-primary-foreground" fill="currentColor" /> : <Play className="w-2 h-2 text-primary-foreground ml-0.5" fill="currentColor" />}
                          </button>
                        </div>
                      ) : null}

                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="w-[24px] h-[24px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground shadow-sm" title="Télécharger">
                          <Download className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.prompt); toast.success("Prompt copié !"); }} className="w-[24px] h-[24px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-foreground shadow-sm" title="Copier le prompt">
                          <RotateCcw className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} className="w-[24px] h-[24px] rounded-md flex items-center justify-center bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all text-foreground shadow-sm" title="Supprimer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom info bar */}
                    {prefs.zoom <= 3 && (
                      <div className="px-2 py-1.5 flex items-center justify-between border-t border-border/50">
                        <span className="text-[9px] text-muted-foreground">{timeAgo(item.created_at)}</span>
                        {typeTag(item.tool_type)}
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
            <span className="text-sm font-medium text-foreground">{selectionCount} sélectionné{selectionCount > 1 ? "s" : ""}</span>
            <div className="w-px h-5 bg-border" />
            <button onClick={clearSelection} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">Annuler</button>
            <button onClick={handleBatchDelete} disabled={batchDeleting} className="px-4 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium flex items-center gap-2">
              {batchDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Détails</h2>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
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
                  </div>
                  <audio src={selected.displayUrl} controls className="w-full" />
                </div>
              )}
              <div className="space-y-3">
                <p className="text-sm text-foreground">{selected.prompt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selected.created_at).toLocaleDateString("fr-FR")}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {selected.model}</span>
                  <span className="flex items-center gap-1">{selected.credits_used} cauris</span>
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
