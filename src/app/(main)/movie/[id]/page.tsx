// ──────────────────────────────────────────────────
// /movie/[id] — Movie Detail Page
// Sprint 7
// ──────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { validateTMDBId } from "@/lib/validation";
import {
  getMovieDetail,
  getMovieCredits,
  getMovieRecommendations,
} from "@/lib/tmdb";
import { getTMDBImageUrl } from "@/lib/utils";
import { truncateText } from "@/lib/utils";
import type { MediaItem } from "@/types";

import MovieHero from "@/components/catalog/MovieHero";
import MovieInfo from "@/components/catalog/MovieInfo";
import CastCarousel from "@/components/catalog/CastCarousel";
import RecommendationsGrid from "@/components/catalog/RecommendationsGrid";
import VideoPlayer from "@/components/player/VideoPlayer";
import WatchHistorySaver from "@/components/player/WatchHistorySaver";

// ── Props type ────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Metadata ──────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const numericId = validateTMDBId(id);
    const movie = await getMovieDetail(numericId);
    return {
      title: `${movie.title} — Cinema`,
      description: truncateText(movie.overview, 160),
      openGraph: {
        title: movie.title,
        description: truncateText(movie.overview, 160),
        images: movie.backdrop_path
          ? [{ url: getTMDBImageUrl(movie.backdrop_path, "w780") ?? "" }]
          : [],
      },
    };
  } catch {
    return { title: "Película — Cinema" };
  }
}

// ── Page ──────────────────────────────────────────
export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format
  let numericId: number;
  try {
    numericId = validateTMDBId(id);
  } catch {
    notFound();
  }

  // Fetch data in parallel
  const [movie, credits, recommendations] = await Promise.all([
    getMovieDetail(numericId).catch(() => null),
    getMovieCredits(numericId).catch(() => ({ id: numericId, cast: [], crew: [] })),
    getMovieRecommendations(numericId).catch(() => ({ results: [] as MediaItem[], page: 1, total_pages: 0, total_results: 0 })),
  ]);

  if (!movie) notFound();

  const recsItems = recommendations.results as MediaItem[];

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* ── Backdrop ────────────────────────────── */}
      <MovieHero movie={movie} />

      {/* ── Info section ────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 lg:px-12 -mt-16 relative z-10 space-y-12 pb-4">
        <MovieInfo movie={movie} />

        {/* ── Cast ──────────────────────────────── */}
        {credits.cast.length > 0 && <CastCarousel cast={credits.cast} />}
      </div>

      {/* ── Video Player (theater mode — full black bg) ── */}
      <section className="bg-black py-8" aria-label="Reproductor">
        <VideoPlayer
          tmdbId={movie.id}
          type="movie"
          backdropUrl={movie.backdrop_path ? getTMDBImageUrl(movie.backdrop_path, "w780") : null}
          title={movie.title}
        />
      </section>

      {/* ── Recommendations ──────────────────────── */}
      {recsItems.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 lg:px-12 py-12">
          <RecommendationsGrid items={recsItems} />
        </div>
      )}

      {/* ── Watch History Saver (invisible) ──────── */}
      <WatchHistorySaver
        tmdbId={movie.id}
        title={movie.title}
        posterPath={movie.poster_path}
        type="movie"
      />
    </div>
  );
}
