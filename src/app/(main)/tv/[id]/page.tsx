// ──────────────────────────────────────────────────
// /tv/[id] — TV Show Detail Page
// Sprint 10
// ──────────────────────────────────────────────────

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { validateTMDBId } from "@/lib/validation";
import { getTVShowDetail, getTVShowCredits, getTVShowRecommendations, getSeasonDetail } from "@/lib/tmdb";
import { getTMDBImageUrl, truncateText } from "@/lib/utils";
import { injectTVMediaType } from "@/types";

import MovieHero from "@/components/catalog/MovieHero";
import TVShowInfo from "@/components/catalog/TVShowInfo";
import CastCarousel from "@/components/catalog/CastCarousel";
import RecommendationsGrid from "@/components/catalog/RecommendationsGrid";
import TVPlayerSection from "@/components/player/TVPlayerSection";
import WatchHistorySaver from "@/components/player/WatchHistorySaver";
import WatchlistButton from "@/components/ui/WatchlistButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const numericId = validateTMDBId(id);
    const show = await getTVShowDetail(numericId);
    return {
      title: `${show.name} — Cinema`,
      description: truncateText(show.overview, 160),
      openGraph: {
        title: show.name,
        description: truncateText(show.overview, 160),
        images: show.backdrop_path
          ? [{ url: getTMDBImageUrl(show.backdrop_path, "w780") ?? "" }]
          : [],
      },
    };
  } catch {
    return { title: "Serie — Cinema" };
  }
}

export default async function TVPage({ params }: PageProps) {
  const { id } = await params;

  let numericId: number;
  try {
    numericId = validateTMDBId(id);
  } catch {
    notFound();
  }

  const [show, credits, recommendations] = await Promise.all([
    getTVShowDetail(numericId).catch(() => null),
    getTVShowCredits(numericId).catch(() => ({ id: numericId, cast: [], crew: [] })),
    getTVShowRecommendations(numericId).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 })),
  ]);

  if (!show) notFound();

  // Get the first available season (skip season 0 if there are regular seasons)
  const regularSeasons = show.seasons.filter((s) => s.season_number > 0);
  const firstSeason = regularSeasons[0] ?? show.seasons[0];
  const initialEpisodes = firstSeason
    ? await getSeasonDetail(numericId, firstSeason.season_number)
        .then((d) => d.episodes)
        .catch(() => [])
    : [];

  const recsItems = injectTVMediaType(recommendations.results);

  return (
    <div className="min-h-screen animate-fadeIn">
      <MovieHero movie={show} />

      <div className="mx-auto max-w-7xl px-4 lg:px-12 -mt-16 relative z-10 space-y-12 pb-4">
        <TVShowInfo
          show={show}
          actions={
            <WatchlistButton
              variant="pill"
              tmdbId={show.id}
              mediaType="tv"
              title={show.name}
              posterPath={show.poster_path}
              backdropPath={show.backdrop_path}
              genreIds={show.genres.map((g) => g.id)}
              releaseYear={show.first_air_date ? new Date(show.first_air_date).getFullYear() : null}
            />
          }
        />
        {credits.cast.length > 0 && <CastCarousel cast={credits.cast} />}
      </div>

      {/* ── Player section ──────────────────────── */}
      <TVPlayerSection
        seriesId={numericId}
        seasons={show.seasons}
        initialEpisodes={initialEpisodes}
        initialSeason={firstSeason?.season_number ?? 1}
        backdropUrl={show.backdrop_path ? getTMDBImageUrl(show.backdrop_path, "w780") : null}
        seriesTitle={show.name}
        posterPath={show.poster_path}
        genreIds={show.genres.map((g) => g.id)}
        releaseYear={show.first_air_date ? new Date(show.first_air_date).getFullYear() : null}
      />

      {/* ── Recommendations ─────────────────────── */}
      {recsItems.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 lg:px-12 py-12">
          <RecommendationsGrid items={recsItems} />
        </div>
      )}

      <WatchHistorySaver
        tmdbId={show.id}
        title={show.name}
        posterPath={show.poster_path}
        type="tv"
      />
    </div>
  );
}
