import { useState, useCallback, useRef, useEffect } from "react";

export function useGallerySelection(itemIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragRect = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragStartedOnCard = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const toggleSelect = useCallback((id: string, ctrlKey: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ctrlKey) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
      } else {
        if (next.size === 1 && next.has(id)) {
          next.clear();
        } else {
          next.clear();
          next.add(id);
        }
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Start drag from anywhere (cards included) with left button
    if (e.button !== 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragStartedOnCard.current = !!(e.target as HTMLElement).closest("[data-gallery-card]");
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!isDragging && Math.abs(dx) + Math.abs(dy) < 8) return;

    if (!isDragging) setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const x = Math.min(dragStart.current.x, e.clientX) - cRect.left + container.scrollLeft;
    const y = Math.min(dragStart.current.y, e.clientY) - cRect.top + container.scrollTop;
    const w = Math.abs(dx);
    const h = Math.abs(dy);

    dragRect.current = { x, y, w, h };
    setDragBox({ x, y, w, h });

    // Find intersecting cards
    const cards = container.querySelectorAll("[data-gallery-card]");
    const newSelected = new Set<string>();
    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardX = cardRect.left - cRect.left + container.scrollLeft;
      const cardY = cardRect.top - cRect.top + container.scrollTop;
      const cardW = cardRect.width;
      const cardH = cardRect.height;

      if (
        x < cardX + cardW &&
        x + w > cardX &&
        y < cardY + cardH &&
        y + h > cardY
      ) {
        const id = card.getAttribute("data-gallery-card");
        if (id) newSelected.add(id);
      }
    });

    if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => {
        const merged = new Set(prev);
        newSelected.forEach((id) => merged.add(id));
        return merged;
      });
    } else {
      setSelectedIds(newSelected);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    const wasDragging = isDragging;
    dragStart.current = null;
    dragRect.current = null;
    dragStartedOnCard.current = false;
    setIsDragging(false);
    setDragBox(null);
    return wasDragging;
  }, [isDragging]);

  // Global mouseup to end drag even outside container
  useEffect(() => {
    const handler = () => {
      if (dragStart.current) {
        dragStart.current = null;
        dragRect.current = null;
        setIsDragging(false);
        setDragBox(null);
      }
    };
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    isDragging,
    dragBox,
    containerRef,
    toggleSelect,
    clearSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isSelected: (id: string) => selectedIds.has(id),
    selectionCount: selectedIds.size,
  };
}
