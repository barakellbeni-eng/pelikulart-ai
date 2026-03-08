import { useState, useRef, useEffect } from "react";
import { FolderOpen, Plus, Trash2, Pencil, Check, X, Loader2, FolderClosed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, type Project } from "@/hooks/useProjects";
import { getSignedUrl } from "@/lib/storage";

export default function ProjectsPanel() {
  const {
    projects,
    loading,
    selectedProjectId,
    selectProject,
    createProject,
    renameProject,
    deleteProject,
  } = useProjects();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  // Resolve cover signed URLs
  useEffect(() => {
    const resolve = async () => {
      const updates: Record<string, string> = {};
      for (const p of projects) {
        if (p.cover_url && !coverUrls[p.id]) {
          const signed = await getSignedUrl(p.cover_url);
          if (signed) updates[p.id] = signed;
        }
      }
      if (Object.keys(updates).length > 0) {
        setCoverUrls((prev) => ({ ...prev, ...updates }));
      }
    };
    resolve();
  }, [projects]);

  useEffect(() => {
    if (isCreating && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleCreate = async () => {
    if (!newName.trim()) { setIsCreating(false); return; }
    await createProject(newName);
    setNewName("");
    setIsCreating(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) { setEditingId(null); return; }
    await renameProject(id, editName);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold">
          Projets
        </span>
        <button
          onClick={() => { setIsCreating(true); setNewName(""); }}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          title="Nouveau projet"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* "Tous" button */}
      <button
        onClick={() => selectProject(null)}
        className={`mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
          !selectedProjectId
            ? "bg-primary/15 text-primary font-medium"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        }`}
      >
        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Toutes les créations</span>
      </button>

      {/* Create inline */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-2 mb-1 overflow-hidden"
          >
            <div className="flex items-center gap-1 bg-sidebar-accent/40 rounded-lg px-2 py-1.5">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                placeholder="Nom du projet…"
                className="flex-1 bg-transparent text-xs text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/40"
              />
              <button onClick={handleCreate} className="p-0.5 text-primary hover:text-primary/80">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsCreating(false)} className="p-0.5 text-sidebar-foreground/40 hover:text-sidebar-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-sidebar-foreground/30" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-[11px] text-sidebar-foreground/40 text-center py-4 px-2">
            Aucun projet.{" "}
            <button onClick={() => setIsCreating(true)} className="text-primary hover:underline">
              Créer un projet
            </button>
          </p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={`group relative flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer text-xs transition-all ${
                selectedProjectId === p.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              {/* Cover mini thumbnail or icon */}
              {p.cover_url && coverUrls[p.id] ? (
                <img
                  src={coverUrls[p.id]}
                  alt=""
                  className="w-6 h-6 rounded object-cover shrink-0 border border-border/20"
                />
              ) : (
                <FolderClosed className="w-3.5 h-3.5 shrink-0 opacity-60" />
              )}

              {/* Name or edit input */}
              {editingId === p.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    ref={editRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 bg-transparent text-xs outline-none min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRename(p.id); }}
                    className="p-0.5 text-primary"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate flex-1">{p.name}</span>
                  {p.generation_count !== undefined && p.generation_count > 0 && (
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                      {p.generation_count}
                    </span>
                  )}
                </>
              )}

              {/* Actions */}
              {editingId !== p.id && (
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(p.id);
                      setEditName(p.name);
                    }}
                    className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/40 hover:text-sidebar-foreground"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Supprimer "${p.name}" ? Les créations seront conservées.`)) {
                        deleteProject(p.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-destructive/20 text-sidebar-foreground/40 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
