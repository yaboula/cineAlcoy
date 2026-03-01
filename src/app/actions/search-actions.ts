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
  // ── Input validation (client data is untrusted) ──
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > 200) {
    return { items: [], totalPages: 0 };
  }
  if (!Number.isInteger(page) || page < 1 || page > 500) {
    return { items: [], totalPages: 0 };
  }

  const data = await searchMulti(trimmed, page);
  return {
    items: filterMediaItems(data.results),
    totalPages: data.total_pages,
  };
}
