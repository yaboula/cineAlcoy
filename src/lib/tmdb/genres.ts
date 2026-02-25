// ──────────────────────────────────────────────────
// Cinema App — TMDB Genre Endpoints
// ──────────────────────────────────────────────────

import type { Genre } from "@/types";
import { tmdbFetch } from "./fetcher";

interface GenreListResponse {
  genres: Genre[];
}

/**
 * Get the list of official movie genres.
 * Cached for 24 hours since genres rarely change.
 */
export async function getMovieGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(
    "/genre/movie/list",
    undefined,
    { revalidate: 86400 }
  );
  return data.genres;
}

/**
 * Get the list of official TV genres.
 * Cached for 24 hours since genres rarely change.
 */
export async function getTVGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(
    "/genre/tv/list",
    undefined,
    { revalidate: 86400 }
  );
  return data.genres;
}
