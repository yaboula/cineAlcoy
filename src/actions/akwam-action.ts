"use server";

// ──────────────────────────────────────────────────
// Cinema App — Akwam Server Action
//
// Orchestrates: TMDB title lookup → Akwam scrape → mp4 URL
// Called from VideoPlayer (Client Component) when the user
// selects the "Akwam" source and clicks play.
// ──────────────────────────────────────────────────

import { scrapeAkwam } from "@/lib/scrapers/akwam";
import { tmdbFetch } from "@/lib/tmdb/fetcher";

// ── Types ─────────────────────────────────────────

interface TMDBMovieBasic {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
}

export interface FetchAkwamResult {
  url: string | null;
  error: string | null;
}

// ── Action ────────────────────────────────────────

/**
 * Server action: look up the movie in TMDB to resolve its title,
 * then scrape Akwam for a direct .mp4 stream URL.
 *
 * Returns a plain-serializable object safe to consume in Client Components.
 *
 * @param tmdbId - Numeric TMDB movie ID (validated server-side).
 */
export async function fetchAkwamStreamUrl(
  tmdbId: number
): Promise<FetchAkwamResult> {
  // 1. Guard: tmdbId must be a safe positive integer
  if (!Number.isInteger(tmdbId) || tmdbId <= 0 || tmdbId > 10_000_000) {
    return { url: null, error: "ID de película inválido" };
  }

  // 2. Fetch minimal movie metadata from TMDB (cached 1 h server-side)
  let movie: TMDBMovieBasic;
  try {
    movie = await tmdbFetch<TMDBMovieBasic>(
      `/movie/${tmdbId}`,
      {},
      { revalidate: 3600 }
    );
  } catch {
    return { url: null, error: "No se pudo obtener información de TMDB" };
  }

  // 3. For originally-Arabic films use the Arabic title as primary search term.
  //    For foreign films dubbed/subtitled in Arabic, use the translated title.
  const primaryTitle =
    movie.original_language === "ar" ? movie.original_title : movie.title;
  const fallbackTitle =
    movie.original_language === "ar" ? movie.title : movie.original_title;

  // 4. Run the Akwam scraping pipeline
  const result = await scrapeAkwam(primaryTitle, fallbackTitle);

  return { url: result.mp4Url, error: result.error };
}
