"use server";

// ──────────────────────────────────────────────────
// Server Actions — TMDB data fetchers
// Sprint 10
// ──────────────────────────────────────────────────

import { getSeasonDetail } from "@/lib/tmdb";
import type { Episode } from "@/types";

/**
 * Fetch episodes for a given TV series season.
 * Called from client components (SeasonSelector, EpisodeList).
 */
export async function fetchSeasonEpisodes(
  seriesId: number,
  seasonNumber: number
): Promise<Episode[]> {
  const data = await getSeasonDetail(seriesId, seasonNumber);
  return data.episodes;
}
