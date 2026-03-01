// ──────────────────────────────────────────────────
// Cinema App — Domain Types
// ──────────────────────────────────────────────────

// ─── Genres ──────────────────────────────────────

export interface Genre {
  id: number;
  name: string;
}

// ─── Movie (Summary for Cards/Grids) ─────────────

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "movie";
}

// ─── Movie (Full Detail) ─────────────────────────

export interface MovieDetail {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  original_language: string;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ─── TV Show (Summary for Cards/Grids) ───────────

export interface TVShowSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "tv";
}

// ─── TV Show (Full Detail) ───────────────────────

export interface TVShowDetail {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: SeasonSummary[];
  episode_run_time: number[];
  original_language: string;
  networks: Network[];
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ─── Season ──────────────────────────────────────

export interface SeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface SeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episodes: Episode[];
}

// ─── Episode ─────────────────────────────────────

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}

// ─── Credits ─────────────────────────────────────

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// ─── Paginated Responses ─────────────────────────

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MovieListResponse = TMDBPaginatedResponse<MovieSummary>;
export type TVShowListResponse = TMDBPaginatedResponse<TVShowSummary>;

// ─── Search (Discriminated Union) ────────────────

export interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type: "person";
}

export type MultiSearchResult = MovieSummary | TVShowSummary | PersonResult;
export type MultiSearchResponse = TMDBPaginatedResponse<MultiSearchResult>;

// ─── Trending (raw result from TMDB has no guaranteed media_type on all items) ─

export interface TrendingMovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "movie";
}

export interface TrendingTVResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "tv";
}

export type TrendingResult = TrendingMovieResult | TrendingTVResult;
export type TrendingResponse = TMDBPaginatedResponse<TrendingResult>;

// ─── Watch History (localStorage) ────────────────

export interface WatchHistoryItem {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  type: "movie" | "tv";
  timestamp: number;
}

export const WATCH_HISTORY_KEY = "cinema_watch_history";
export const WATCH_HISTORY_MAX_ITEMS = 30;

// ─── Image Helpers ───────────────────────────────

export type TMDBImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

export function getTMDBImageUrl(
  path: string | null,
  size: TMDBImageSize = "w500"
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ─── Media Item (unified type for cards) ─────────

export type MediaItem = MovieSummary | TVShowSummary;

/** Helper to get display title from any media item */
export function getMediaTitle(item: MediaItem): string {
  if (item.media_type === "movie") return item.title;
  return item.name;
}

/** Helper to get release year from any media item */
export function getMediaYear(item: MediaItem): string {
  const date = item.media_type === "movie" ? item.release_date : item.first_air_date;
  if (!date) return "";
  return date.substring(0, 4);
}

/**
 * Inject `media_type` into TMDB list endpoint results.
 * TMDB list endpoints (e.g. /movie/popular) don't include `media_type` in responses,
 * but our MediaItem union type requires it for correct discrimination.
 */
export function injectMovieMediaType(items: Omit<MovieSummary, "media_type">[]): MovieSummary[] {
  return items.map((item) => ({ ...item, media_type: "movie" as const }));
}

export function injectTVMediaType(items: Omit<TVShowSummary, "media_type">[]): TVShowSummary[] {
  return items.map((item) => ({ ...item, media_type: "tv" as const }));
}
