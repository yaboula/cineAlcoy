// ──────────────────────────────────────────────────
// MediaGrid — Flat responsive grid for search results
// (no section title — used in /search page)
// ──────────────────────────────────────────────────

import MediaCard from "@/components/catalog/MediaCard";
import type { MediaItem } from "@/types";

interface MediaGridProps {
  items: MediaItem[];
}

export default function MediaGrid({ items }: MediaGridProps) {
  if (items.length === 0) return null;

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      role="list"
      aria-label="Resultados de búsqueda"
    >
      {items.map((item) => (
        <div key={`${item.media_type}-${item.id}`} role="listitem">
          <MediaCard item={item} />
        </div>
      ))}
    </div>
  );
}
