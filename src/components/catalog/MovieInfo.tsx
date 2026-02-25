// ──────────────────────────────────────────────────
// MovieInfo — Poster sidebar + full movie metadata
// Server Component
// ──────────────────────────────────────────────────

import ImageWithFallback from "@/components/ui/ImageWithFallback";
import GenreBadge from "@/components/ui/GenreBadge";
import RatingBadge from "@/components/ui/RatingBadge";
import { getTMDBImageUrl } from "@/lib/utils";
import { formatRuntime } from "@/lib/utils";
import type { MovieDetail } from "@/types";

interface MovieInfoProps {
  movie: MovieDetail;
}

export default function MovieInfo({ movie }: MovieInfoProps) {
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const year = movie.release_date?.substring(0, 4);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ── Poster ──────────────────────────────── */}
      <div className="hidden md:block w-52 lg:w-64 shrink-0">
        <div className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <ImageWithFallback
            src={posterUrl}
            alt={`Póster de ${movie.title}`}
            fill
            sizes="256px"
            priority
          />
        </div>
      </div>

      {/* ── Info ────────────────────────────────── */}
      <div className="flex-1 space-y-4">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight">
          {movie.title}
        </h1>

        {/* Tagline */}
        {movie.tagline && (
          <p className="text-sm text-text-muted italic">&ldquo;{movie.tagline}&rdquo;</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {year && <span>{year}</span>}
          {movie.runtime ? (
            <span className="flex items-center gap-1">
              <span className="text-border">·</span>
              {formatRuntime(movie.runtime)}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <span className="text-border">·</span>
            <RatingBadge score={movie.vote_average} size="md" />
            <span className="text-text-muted text-xs">({movie.vote_count.toLocaleString()} votos)</span>
          </span>
        </div>

        {/* Genres */}
        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <GenreBadge key={g.id} name={g.name} />
            ))}
          </div>
        )}

        {/* Overview */}
        {movie.overview && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 pl-2 border-l border-accent-primary/60">
              Sinopsis
            </h2>
            <p className="text-sm text-text-secondary leading-7">{movie.overview}</p>
          </div>
        )}

        {/* Additional info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2 text-xs text-text-muted border-t border-border/50">
          <div>
            <span className="text-text-secondary font-medium">Estado:</span>{" "}
            {movie.status}
          </div>
          <div>
            <span className="text-text-secondary font-medium">Idioma:</span>{" "}
            {movie.original_language.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
