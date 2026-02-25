"use client";

// ──────────────────────────────────────────────────
// MediaCard — Poster card for movies and TV shows
// Hover: scale + shadow. Uses framer-motion.
// ──────────────────────────────────────────────────

import Link from "next/link";
import { motion } from "framer-motion";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import RatingBadge from "@/components/ui/RatingBadge";
import WatchlistButton from "@/components/ui/WatchlistButton";
import { getTMDBImageUrl } from "@/lib/utils";
import type { MediaItem } from "@/types";
import { getMediaTitle, getMediaYear } from "@/types";

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const href = item.media_type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
  const title = getMediaTitle(item);
  const year = getMediaYear(item);
  const posterUrl = getTMDBImageUrl(item.poster_path, "w342");

  return (
    <Link
      href={href}
      className="group block rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Ver ${title}${year ? ` (${year})` : ""}`}
    >
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative"
      >
        {/* ── Poster ─────────────────────────────── */}
        <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-surface-hover shadow-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/50">
          <ImageWithFallback
            src={posterUrl}
            alt={`Póster de ${title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 17vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="text-xs font-semibold text-white bg-accent-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              Ver
            </span>
          </div>

          {/* Rating badge — top-right overlay */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5">
              <RatingBadge score={item.vote_average} size="sm" />
            </div>
          )}

          {/* Media type badge — top-left */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-accent-primary/90 text-white px-1.5 py-0.5 rounded-sm">
              {item.media_type === "movie" ? "Película" : "Serie"}
            </span>
          </div>

          {/* Watchlist icon — bottom-right, visible on hover */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WatchlistButton
              variant="icon"
              tmdbId={item.id}
              mediaType={item.media_type as "movie" | "tv"}
              title={title}
              posterPath={item.poster_path}
              backdropPath={item.backdrop_path}
              genreIds={item.genre_ids}
              releaseYear={year ? parseInt(year) : null}
            />
          </div>
        </div>

        {/* ── Text ───────────────────────────────── */}
        <div className="pt-2.5 px-0.5">
          <p
            className="text-sm font-medium text-text-primary leading-snug line-clamp-1 group-hover:text-accent-hover transition-colors duration-200"
            title={title}
          >
            {title}
          </p>
          {year && (
            <p className="text-xs text-text-muted mt-0.5">{year}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
