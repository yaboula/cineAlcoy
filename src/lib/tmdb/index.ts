// ──────────────────────────────────────────────────
// Cinema App — TMDB Barrel Export
// ──────────────────────────────────────────────────

export { tmdbFetch, TMDBError } from "./fetcher";
export {
  getPopularMovies,
  getNowPlayingMovies,
  getTopRatedMovies,
  getMovieDetail,
  getMovieCredits,
  getMovieRecommendations,
} from "./movies";
export {
  getPopularTVShows,
  getOnTheAirTVShows,
  getTopRatedTVShows,
  getTVShowDetail,
  getTVShowCredits,
  getSeasonDetail,
  getTVShowRecommendations,
} from "./tv";
export { searchMulti, getTrending } from "./search";
export { getMovieGenres, getTVGenres } from "./genres";
