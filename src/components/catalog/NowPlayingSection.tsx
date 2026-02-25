// ──────────────────────────────────────────────────
// NowPlayingSection — Server Component
// ──────────────────────────────────────────────────

import { getNowPlayingMovies } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import type { MediaItem } from "@/types";

export default async function NowPlayingSection() {
  const data = await getNowPlayingMovies();
  const items = data.results as MediaItem[];
  return <MediaRow title="Estrenos en cines" items={items} seeAllHref="/movies" />;
}
