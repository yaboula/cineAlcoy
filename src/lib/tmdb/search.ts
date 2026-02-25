// ──────────────────────────────────────────────────
// Cinema App — TMDB Search & Trending Endpoints
// ──────────────────────────────────────────────────

import type { MultiSearchResponse, TrendingResponse } from "@/types";
import { tmdbFetch } from "./fetcher";

/**
 * Search for movies, TV shows, and people.
 * Results contain a discriminated `media_type` field.
 */
export async function searchMulti(
  query: string,
  page: number = 1
): Promise<MultiSearchResponse> {
  return tmdbFetch<MultiSearchResponse>(
    "/search/multi",
    { query, page },
    { revalidate: 60 }
  );
}

/**
 * Get trending content.
 * @param mediaType - "all", "movie", or "tv"
 * @param timeWindow - "day" or "week"
 */
export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TrendingResponse> {
  return tmdbFetch<TrendingResponse>(
    `/trending/${mediaType}/${timeWindow}`
  );
}
