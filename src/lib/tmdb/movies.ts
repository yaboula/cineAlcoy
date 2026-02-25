// ──────────────────────────────────────────────────
// Cinema App — TMDB Movie Endpoints
// ──────────────────────────────────────────────────

import type {
  MovieDetail,
  MovieListResponse,
  CreditsResponse,
} from "@/types";
import { tmdbFetch } from "./fetcher";

/**
 * Get a list of popular movies (page of 20).
 */
export async function getPopularMovies(
  page: number = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>("/movie/popular", { page });
}

/**
 * Get movies currently in theatres.
 */
export async function getNowPlayingMovies(
  page: number = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>("/movie/now_playing", { page });
}

/**
 * Get top rated movies.
 */
export async function getTopRatedMovies(
  page: number = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>("/movie/top_rated", { page });
}

/**
 * Get full details for a single movie.
 */
export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`);
}

/**
 * Get cast and crew for a movie.
 */
export async function getMovieCredits(id: number): Promise<CreditsResponse> {
  return tmdbFetch<CreditsResponse>(`/movie/${id}/credits`);
}

/**
 * Get recommended movies for a given movie.
 */
export async function getMovieRecommendations(
  id: number,
  page: number = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>(`/movie/${id}/recommendations`, { page });
}
