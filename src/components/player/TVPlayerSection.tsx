"use client";

// ──────────────────────────────────────────────────
// TVPlayerSection — Client component combining:
//   VideoPlayer + SeasonSelector + EpisodeList
// Sprint 10
// ──────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import VideoPlayer from "@/components/player/VideoPlayer";
import { fetchSeasonEpisodes } from "@/app/actions/tmdb";
import { getTMDBImageUrl } from "@/lib/utils";
import type { SeasonSummary, Episode } from "@/types";
import { Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVPlayerSectionProps {
  seriesId: number;
  seasons: SeasonSummary[];
  initialEpisodes: Episode[];
  initialSeason: number;
  backdropUrl?: string | null;
  seriesTitle?: string;
  posterPath?: string | null;
  genreIds?: number[];
  releaseYear?: number | null;
}

export default function TVPlayerSection({
  seriesId,
  seasons,
  initialEpisodes,
  initialSeason,
  backdropUrl,
  seriesTitle,
  posterPath,
  genreIds,
  releaseYear,
}: TVPlayerSectionProps) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [seasonError, setSeasonError] = useState(false);

  async function handleSeasonChange(seasonNum: number) {
    if (seasonNum === currentSeason) return;
    setIsLoadingEpisodes(true);
    setSeasonError(false);
    try {
      const eps = await fetchSeasonEpisodes(seriesId, seasonNum);
      setEpisodes(eps);
      setCurrentSeason(seasonNum);
      setCurrentEpisode(1);
    } catch {
      setSeasonError(true);
    } finally {
      setIsLoadingEpisodes(false);
    }
  }

  function handleEpisodeSelect(epNumber: number) {
    setCurrentEpisode(epNumber);
  }

  // Only show actual seasons (season_number > 0) + Specials if present
  const displaySeasons = seasons.filter((s) => s.episode_count > 0);

  return (
    <div className="bg-black py-8">
      <div className="mx-auto max-w-5xl px-0 md:px-4 space-y-6">
        {/* ── Player ────────────────────────────────── */}
        <VideoPlayer
          tmdbId={seriesId}
          type="tv"
          season={currentSeason}
          episode={currentEpisode}
          backdropUrl={backdropUrl}
          title={seriesTitle ? `${seriesTitle} — T${currentSeason}:E${currentEpisode}` : undefined}
          posterPath={posterPath}
          genreIds={genreIds}
          releaseYear={releaseYear}
        />

        {/* ── Season + Episode controls ─────────────── */}
        <div className="px-4 md:px-0 space-y-5">

          {/* Season selector — pill chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-muted uppercase tracking-widest mr-1">
              Temporada
            </span>
            {displaySeasons.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSeasonChange(s.season_number)}
                disabled={isLoadingEpisodes}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-50",
                  s.season_number === currentSeason
                    ? "bg-accent-primary text-white shadow-md shadow-accent-primary/30"
                    : "bg-surface border border-border text-text-secondary hover:border-accent-primary/50 hover:text-text-primary"
                )}
              >
                {s.season_number === 0 ? "Especiales" : `T${s.season_number}`}
                <span className="ml-1 opacity-60 text-[10px]">{s.episode_count}</span>
              </button>
            ))}
            {isLoadingEpisodes && (
              <svg
                className="w-4 h-4 animate-spin text-accent-primary ml-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M12 3a9 9 0 109 9" />
              </svg>
            )}
          </div>

          {seasonError && (
            <p className="text-sm text-destructive animate-fadeIn">
              No se pudieron cargar los episodios.{" "}
              <button
                onClick={() => handleSeasonChange(currentSeason)}
                className="underline underline-offset-2 hover:text-destructive/80 transition-colors"
              >
                Reintentar
              </button>
            </p>
          )}

          {/* Episode list */}
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1 -mr-1">
            {episodes.map((ep) => {
              const isActive = ep.episode_number === currentEpisode;
              const thumbUrl = ep.still_path ? getTMDBImageUrl(ep.still_path, "w342") : null;

              return (
                <button
                  key={ep.id}
                  onClick={() => handleEpisodeSelect(ep.episode_number)}
                  className={cn(
                    "w-full text-left rounded-lg transition-all duration-200 flex items-start gap-3 p-2 group",
                    isActive
                      ? "bg-accent-primary/15 border border-accent-primary/40 text-text-primary"
                      : "border border-transparent hover:bg-surface text-text-secondary hover:text-text-primary"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 shrink-0 aspect-video rounded overflow-hidden bg-surface-hover">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={`Miniatura de ${ep.name}`}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-text-muted text-lg font-bold opacity-30">
                          {ep.episode_number}
                        </span>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute inset-0 bg-accent-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                          <svg viewBox="0 0 10 10" className="w-3 h-3 fill-white ml-0.5">
                            <polygon points="2,1 9,5 2,9" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "text-accent-primary" : "text-text-muted")}>
                        E{ep.episode_number}
                      </span>
                      <span className="text-sm font-medium line-clamp-1 flex-1">{ep.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      {ep.runtime && ep.runtime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {ep.runtime}m
                        </span>
                      )}
                      {ep.vote_average > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-rating-star text-rating-star" />
                          {ep.vote_average.toFixed(1)}
                        </span>
                      )}
                      {ep.air_date && (
                        <span>{new Date(ep.air_date).getFullYear()}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
