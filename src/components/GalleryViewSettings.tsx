import { useState } from "react";
import { SlidersHorizontal, Filter, Rows3, LayoutGrid } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/* ---- View mode popover ---- */

export type GalleryLayout = "row" | "grid";
export type GalleryImageSize = "mini" | "small" | "medium" | "large";

interface ViewModeProps {
  layout: GalleryLayout;
  imageSize: GalleryImageSize;
  onLayoutChange: (l: GalleryLayout) => void;
  onImageSizeChange: (s: GalleryImageSize) => void;
}

export function ViewModePopover({ layout, imageSize, onLayoutChange, onImageSizeChange }: ViewModeProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" title="Vue">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-4 space-y-4 bg-card border-border">
        <h3 className="text-sm font-bold text-foreground">View mode</h3>
        <hr className="border-border" />

        {/* Layout */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Layout</span>
          {(["row", "grid"] as const).map((v) => (
            <label key={v} className="flex items-center gap-3 cursor-pointer py-1" onClick={() => onLayoutChange(v)}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${layout === v ? "border-primary" : "border-muted-foreground/40"}`}>
                {layout === v && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </span>
              <span className="text-sm text-foreground capitalize">{v === "row" ? "Row" : "Grid"}</span>
            </label>
          ))}
        </div>

        {/* Image size */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Image Size</span>
          {(["mini", "small", "medium", "large"] as const).map((v) => (
            <label key={v} className="flex items-center gap-3 cursor-pointer py-1" onClick={() => onImageSizeChange(v)}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${imageSize === v ? "border-primary" : "border-muted-foreground/40"}`}>
                {imageSize === v && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </span>
              <span className="text-sm text-foreground capitalize">{v === "mini" ? "Mini" : v === "small" ? "Small" : v === "medium" ? "Medium" : "Large"}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---- Filters popover ---- */

interface FiltersProps {
  typeFilter: "all" | "image" | "video" | "audio";
  onTypeFilterChange: (v: "all" | "image" | "video" | "audio") => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
}

export function FiltersPopover({ typeFilter, onTypeFilterChange, dateFrom, dateTo, onDateFromChange, onDateToChange }: FiltersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" title="Filtres">
          <Filter className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4 space-y-4 bg-card border-border">
        <h3 className="text-sm font-bold text-foreground">Filters</h3>

        {/* Date */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</span>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground"
              placeholder="dd/mm/yy"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground"
              placeholder="dd/mm/yy"
            />
          </div>
        </div>

        {/* Tool */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tool</span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm text-foreground appearance-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
