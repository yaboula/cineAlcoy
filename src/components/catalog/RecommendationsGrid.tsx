// ──────────────────────────────────────────────────
// RecommendationsGrid — "También te puede gustar" section
// Server Component
// ──────────────────────────────────────────────────

import MediaRow from "@/components/catalog/MediaRow";
import type { MediaItem } from "@/types";

interface RecommendationsGridProps {
  items: MediaItem[];
}

export default function RecommendationsGrid({ items }: RecommendationsGridProps) {
  if (items.length === 0) return null;
  return (
    <MediaRow
      title="También te puede gustar"
      items={items.slice(0, 12)}
    />
  );
}
