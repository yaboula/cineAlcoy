// ──────────────────────────────────────────────────
// TrendingSection — Server Component
// Fetches trending (all, week) and renders MediaRow + HeroBanner
// ──────────────────────────────────────────────────

import { getTrending } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import HeroBanner from "@/components/catalog/HeroBanner";
import type { MediaItem } from "@/types";

export default async function TrendingSection() {
  const data = await getTrending("all", "week");
  const results = data.results.filter(
    (r) => r.media_type === "movie" || r.media_type === "tv"
  ) as MediaItem[];

  if (results.length === 0) return null;

  const [heroItem, ...rowItems] = data.results;

  return (
    <>
      <HeroBanner item={heroItem} />
      <div className="mx-auto max-w-7xl px-4 lg:px-12 -mt-6 relative z-10">
        <MediaRow title="Tendencias esta semana" items={rowItems.slice(0, 18) as MediaItem[]} />
      </div>
    </>
  );
}
