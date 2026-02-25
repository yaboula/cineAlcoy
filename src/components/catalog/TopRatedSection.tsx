// ──────────────────────────────────────────────────
// TopRatedSection — Server Component
// ──────────────────────────────────────────────────

import { getTopRatedMovies } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import type { MediaItem } from "@/types";

export default async function TopRatedSection() {
  const data = await getTopRatedMovies();
  const items = data.results as MediaItem[];
  return <MediaRow title="Mejor valoradas" items={items} seeAllHref="/movies" />;
}
