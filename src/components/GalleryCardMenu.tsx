import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Download, FolderPlus, ArrowRightLeft, Trash2 } from "lucide-react";

interface GalleryCardMenuProps {
  onDownload: () => void;
  onDelete: () => void;
  onAddToProject?: () => void;
  onMoveProject?: () => void;
}

export default function GalleryCardMenu({ onDownload, onDelete, onAddToProject, onMoveProject }: GalleryCardMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { label: "Télécharger", icon: Download, action: onDownload },
    ...(onAddToProject ? [{ label: "Ajouter à un projet", icon: FolderPlus, action: onAddToProject }] : []),
    ...(onMoveProject ? [{ label: "Déplacer vers un projet", icon: ArrowRightLeft, action: onMoveProject }] : []),
    { label: "Supprimer", icon: Trash2, action: onDelete, destructive: true },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all text-muted-foreground hover:text-foreground shadow-sm"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.action();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                (item as any).destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
