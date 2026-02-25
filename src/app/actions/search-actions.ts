"use server";

// ──────────────────────────────────────────────────
// Server Actions — Search pagination
// ──────────────────────────────────────────────────

import { searchMulti } from "@/lib/tmdb";
import type { MediaItem, MultiSearchResult } from "@/types";

function filterMediaItems(results: MultiSearchResult[]): MediaItem[] {
  return results.filter(
    (r): r is MediaItem => r.media_type === "movie" || r.media_type === "tv"
  );
}

/**
 * Fetch additional search results (pagination).
 * Called from SearchPageClient on "Load more" click.
 */
export async function searchMoreResults(
  query: string,
  page: number
): Promise<{ items: MediaItem[]; totalPages: number }> {
  const data = await searchMulti(query, page);
  return {
    items: filterMediaItems(data.results),
    totalPages: data.total_pages,
  };
}
