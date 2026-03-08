import {
  LayoutGrid,
  LayoutList,
  SortAsc,
  Calendar,
  Eye,
  EyeOff,
  Grid2x2,
  Grid3x3,
  ZoomIn,
  ZoomOut,
  Camera,
} from "lucide-react";
import type {
  CardSize,
  ViewType,
  SortBy,
  DateFilter,
  TypeFilter,
  SourceFilter,
  GalleryPreferences,
} from "@/hooks/useGalleryPreferences";

interface Props {
  prefs: GalleryPreferences;
  update: <K extends keyof GalleryPreferences>(key: K, value: GalleryPreferences[K]) => void;
}

const sizeButtons: { key: CardSize; label: string }[] = [
  { key: "S", label: "S" },
  { key: "M", label: "M" },
  { key: "L", label: "L" },
];

const viewButtons: { key: ViewType; label: string; icon: typeof LayoutGrid }[] = [
  { key: "grid", label: "Grille", icon: Grid2x2 },
  { key: "masonry", label: "Masonry", icon: LayoutList },
];

const sortOptions: { key: SortBy; label: string }[] = [
  { key: "newest", label: "Plus récent" },
  { key: "oldest", label: "Plus ancien" },
  { key: "type", label: "Par type" },
  { key: "model", label: "Par modèle" },
];

const dateOptions: { key: DateFilter; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois" },
];

const typeOptions: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "image", label: "Images" },
  { key: "video", label: "Vidéos" },
  { key: "audio", label: "Audio" },
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[11px] rounded-full transition-colors font-medium whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
    >
      {active ? <Eye className="w-3 h-3 text-primary" /> : <EyeOff className="w-3 h-3" />}
      {label}
    </button>
  );
}

export default function GalleryToolbar({ prefs, update }: Props) {
  return (
    <div className="glass border-b border-white/[0.06] px-4 py-2.5 space-y-2">
      {/* Row 1: Size / View / Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Card size */}
        <div className="flex items-center gap-1">
          <Grid3x3 className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {sizeButtons.map((s) => (
            <Chip key={s.key} active={prefs.cardSize === s.key} onClick={() => update("cardSize", s.key)}>
              {s.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* View type */}
        <div className="flex items-center gap-1">
          {viewButtons.map((v) => (
            <Chip key={v.key} active={prefs.viewType === v.key} onClick={() => update("viewType", v.key)}>
              <span className="flex items-center gap-1">
                <v.icon className="w-3 h-3" />
                {v.label}
              </span>
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Sort */}
        <div className="flex items-center gap-1">
          <SortAsc className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {sortOptions.map((s) => (
            <Chip key={s.key} active={prefs.sortBy === s.key} onClick={() => update("sortBy", s.key)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Row 2: Filters + Toggles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date filter */}
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {dateOptions.map((d) => (
            <Chip key={d.key} active={prefs.dateFilter === d.key} onClick={() => update("dateFilter", d.key)}>
              {d.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Type filter */}
        <div className="flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground mr-1" />
          {typeOptions.map((t) => (
            <Chip key={t.key} active={prefs.typeFilter === t.key} onClick={() => update("typeFilter", t.key)}>
              {t.label}
            </Chip>
          ))}
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Display toggles */}
        <ToggleRow label="Prompt" active={prefs.showPrompt} onToggle={() => update("showPrompt", !prefs.showPrompt)} />
        <ToggleRow label="Métadonnées" active={prefs.showMeta} onToggle={() => update("showMeta", !prefs.showMeta)} />

        <div className="w-px h-4 bg-border" />

        {/* Zoom slider */}
        <div className="flex items-center gap-2">
          <ZoomOut className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={prefs.zoom}
            onChange={(e) => update("zoom", Number(e.target.value))}
            className="w-20 h-1 accent-primary cursor-pointer"
          />
          <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
