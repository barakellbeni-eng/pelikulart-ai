import { useState, useRef, useEffect } from "react";
import { FolderOpen, Plus, Pencil, Check, X, Loader2, ChevronDown, FolderClosed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, type Project } from "@/hooks/useProjects";

export default function ProjectsPanel() {
  const {
    projects,
    loading,
    selectedProjectId,
    selectProject,
    createProject,
    renameProject,
  } = useProjects();

  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameName, setRenameName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsCreating(false);
        setIsRenaming(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (isCreating && inputRef.current) inputRef.current.focus();
  }, [isCreating]);

  useEffect(() => {
    if (isRenaming && renameRef.current) renameRef.current.focus();
  }, [isRenaming]);

  const handleCreate = async () => {
    if (!newName.trim()) { setIsCreating(false); return; }
    await createProject(newName);
    setNewName("");
    setIsCreating(false);
    setOpen(false);
  };

  const handleRename = async () => {
    if (!renameName.trim() || !activeProject) { setIsRenaming(false); return; }
    await renameProject(activeProject.id, renameName);
    setIsRenaming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-sidebar-foreground/30" />
        <span className="text-xs text-sidebar-foreground/40">Chargement…</span>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* ── Banner: active project ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-sidebar-accent/60 transition-colors rounded-lg mx-1"
        style={{ width: "calc(100% - 0.5rem)" }}
      >
        <FolderOpen className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-sidebar-foreground truncate flex-1">
          {activeProject?.name || "Sans titre"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-sidebar-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1 right-1 top-full mt-1 z-50 bg-sidebar border border-sidebar-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* Project list */}
            <div className="max-h-52 overflow-y-auto scrollbar-thin p-1">
              {/* "Toutes les créations" */}
              <button
                onClick={() => { selectProject(null); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                  !selectedProjectId
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">Toutes les créations</span>
              </button>

              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { selectProject(p.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedProjectId === p.id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
                  }`}
                >
                  <FolderClosed className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate flex-1 text-left">{p.name}</span>
                  {p.generation_count > 0 && (
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">
                      {p.generation_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-sidebar-border p-1.5 space-y-1">
              {/* Rename active project */}
              {activeProject && !isRenaming && (
                <button
                  onClick={() => { setIsRenaming(true); setRenameName(activeProject.name); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Renommer "{activeProject.name}"</span>
                </button>
              )}

              {/* Rename input */}
              {isRenaming && (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    ref={renameRef}
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setIsRenaming(false);
                    }}
                    className="flex-1 bg-sidebar-accent/40 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/40"
                    placeholder="Nouveau nom…"
                  />
                  <button onClick={handleRename} className="p-1 text-primary hover:text-primary/80">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsRenaming(false)} className="p-1 text-sidebar-foreground/40">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Create new */}
              {!isCreating ? (
                <button
                  onClick={() => { setIsCreating(true); setNewName(""); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau projet</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    ref={inputRef}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setIsCreating(false);
                    }}
                    placeholder="Nom du projet…"
                    className="flex-1 bg-sidebar-accent/40 rounded-lg px-2 py-1.5 text-xs text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/40"
                  />
                  <button onClick={handleCreate} className="p-1 text-primary hover:text-primary/80">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setIsCreating(false)} className="p-1 text-sidebar-foreground/40">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
