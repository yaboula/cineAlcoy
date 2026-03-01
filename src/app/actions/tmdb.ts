"use server";

// ──────────────────────────────────────────────────
// Server Actions — TMDB data fetchers
// Sprint 10 · R2 hardened
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
  // Validate inputs — these arrive from the client and cannot be trusted
  if (!Number.isInteger(seriesId) || seriesId <= 0) {
    throw new Error(`Invalid seriesId: ${seriesId}`);
  }
  if (!Number.isInteger(seasonNumber) || seasonNumber < 0) {
    throw new Error(`Invalid seasonNumber: ${seasonNumber}`);
  }

  const data = await getSeasonDetail(seriesId, seasonNumber);
  return data.episodes;
}
