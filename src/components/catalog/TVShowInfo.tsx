// ──────────────────────────────────────────────────
// TVShowInfo — Server Component for TV detail page
// Sprint 10
// ──────────────────────────────────────────────────

import ImageWithFallback from "@/components/ui/ImageWithFallback";
import GenreBadge from "@/components/ui/GenreBadge";
import RatingBadge from "@/components/ui/RatingBadge";
import { getTMDBImageUrl, cn } from "@/lib/utils";
import type { TVShowDetail } from "@/types";

interface TVShowInfoProps {
  show: TVShowDetail;
  actions?: React.ReactNode;
}

export default function TVShowInfo({ show, actions }: TVShowInfoProps) {
  const posterUrl = getTMDBImageUrl(show.poster_path, "w500");
  const year = show.first_air_date?.substring(0, 4);
  const isOngoing = show.status === "Returning Series";

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ── Poster ──────────────────────────────── */}
      <div className="hidden md:block w-52 lg:w-64 shrink-0">
        <div className="relative aspect-2/3 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <ImageWithFallback
            src={posterUrl}
            alt={`Póster de ${show.name}`}
            fill
            sizes="256px"
            priority
          />
        </div>
      </div>

      {/* ── Info ────────────────────────────────── */}
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight">
          {show.name}
        </h1>

        {show.tagline && (
          <p className="text-sm text-text-muted italic">&ldquo;{show.tagline}&rdquo;</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          {year && <span>{year}</span>}
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              isOngoing
                ? "bg-success/20 text-success"
                : "bg-surface text-text-muted"
            )}
          >
            {isOngoing ? "En emisión" : "Finalizada"}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-border">·</span>
            <RatingBadge score={show.vote_average} size="md" />
          </span>
        </div>

        {/* Genres */}
        {show.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {show.genres.map((g) => (
              <GenreBadge key={g.id} name={g.name} />
            ))}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Temporadas" value={show.number_of_seasons.toString()} />
          <Stat label="Episodios" value={show.number_of_episodes.toString()} />
          {show.networks[0] && (
            <Stat label="Red" value={show.networks[0].name} />
          )}
        </div>

        {/* Overview */}
        {show.overview && (
          <div>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 pl-2 border-l border-accent-primary/60">
              Sinopsis
            </h2>
            <p className="text-sm text-text-secondary leading-7">{show.overview}</p>
          </div>
        )}

        {/* Action buttons */}
        {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
