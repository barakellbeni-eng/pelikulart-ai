import { useState, useCallback } from "react";

export type CardSize = "S" | "M" | "L";
export type ViewType = "grid" | "masonry";
export type SortBy = "newest" | "oldest" | "type" | "model";
export type DateFilter = "all" | "today" | "week" | "month";
export type TypeFilter = "all" | "image" | "video" | "audio";
export type SourceFilter = "all" | "standard" | "multiplan";

export interface GalleryPreferences {
  cardSize: CardSize;
  viewType: ViewType;
  sortBy: SortBy;
  dateFilter: DateFilter;
  typeFilter: TypeFilter;
  sourceFilter: SourceFilter;
  showPrompt: boolean;
  showMeta: boolean;
  zoom: number; // 1-5, controls columns
}

const STORAGE_KEY = "pelikulart-gallery-prefs";

const defaults: GalleryPreferences = {
  cardSize: "M",
  viewType: "masonry",
  sortBy: "newest",
  dateFilter: "all",
  typeFilter: "all",
  sourceFilter: "all",
  showPrompt: true,
  showMeta: true,
  zoom: 3,
};

function load(): GalleryPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function useGalleryPreferences() {
  const [prefs, setPrefs] = useState<GalleryPreferences>(load);

  const update = useCallback(<K extends keyof GalleryPreferences>(key: K, value: GalleryPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, update };
}
