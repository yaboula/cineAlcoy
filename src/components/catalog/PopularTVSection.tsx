// ──────────────────────────────────────────────────
// PopularTVSection — Server Component
// ──────────────────────────────────────────────────

import { getPopularTVShows } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import type { MediaItem } from "@/types";

export default async function PopularTVSection() {
  const data = await getPopularTVShows();
  const items = data.results as MediaItem[];
  return <MediaRow title="Series populares" items={items} seeAllHref="/series" />;
}
