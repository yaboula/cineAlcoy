// ──────────────────────────────────────────────────
// Cinema App — TMDB TV Show Endpoints
// ──────────────────────────────────────────────────

import type {
  TVShowDetail,
  TVShowListResponse,
  SeasonDetail,
  CreditsResponse,
} from "@/types";
import { tmdbFetch } from "./fetcher";

/**
 * Get a list of popular TV shows (page of 20).
 */
export async function getPopularTVShows(
  page: number = 1
): Promise<TVShowListResponse> {
  return tmdbFetch<TVShowListResponse>("/tv/popular", { page });
}

/**
 * Get TV shows currently on the air.
 */
export async function getOnTheAirTVShows(
  page: number = 1
): Promise<TVShowListResponse> {
  return tmdbFetch<TVShowListResponse>("/tv/on_the_air", { page });
}

/**
 * Get top rated TV shows.
 */
export async function getTopRatedTVShows(
  page: number = 1
): Promise<TVShowListResponse> {
  return tmdbFetch<TVShowListResponse>("/tv/top_rated", { page });
}

/**
 * Get full details for a single TV show (includes seasons array).
 */
export async function getTVShowDetail(id: number): Promise<TVShowDetail> {
  return tmdbFetch<TVShowDetail>(`/tv/${id}`);
}

/**
 * Get cast and crew for a TV show.
 */
export async function getTVShowCredits(id: number): Promise<CreditsResponse> {
  return tmdbFetch<CreditsResponse>(`/tv/${id}/credits`);
}

/**
 * Get full season detail with episodes list.
 */
export async function getSeasonDetail(
  seriesId: number,
  seasonNumber: number
): Promise<SeasonDetail> {
  return tmdbFetch<SeasonDetail>(`/tv/${seriesId}/season/${seasonNumber}`);
}

/**
 * Get recommended TV shows for a given show.
 */
export async function getTVShowRecommendations(
  id: number,
  page: number = 1
): Promise<TVShowListResponse> {
  return tmdbFetch<TVShowListResponse>(`/tv/${id}/recommendations`, { page });
}
