"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WatchHistoryGrid — full watch history with remove action + filtering
// Sprint R4
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { History, Film, Tv, Trash2 } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { getTMDBImageUrl } from "@/lib/utils";
import { removeFromHistory } from "@/lib/supabase/watch-history";
import { formatWatchTime } from "@/lib/supabase/stats";
import type { WatchHistoryRow } from "@/lib/supabase/types";

type HistoryFilter = "all" | "movie" | "tv";

interface WatchHistoryGridProps {
  items: WatchHistoryRow[];
  profileId: string;
  onRemove: (tmdbId: number, mediaType: "movie" | "tv") => void;
}

export default function WatchHistoryGrid({ items, profileId, onRemove }: WatchHistoryGridProps) {
  const [filter, setFilter] = useState<HistoryFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.media_type === filter);
  }, [items, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    movie: items.filter((i) => i.media_type === "movie").length,
    tv: items.filter((i) => i.media_type === "tv").length,
  }), [items]);

  async function handleRemove(item: WatchHistoryRow) {
    await removeFromHistory(profileId, item.tmdb_id, item.media_type);
    onRemove(item.tmdb_id, item.media_type);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <History className="w-12 h-12 text-text-muted opacity-40" />
        <p className="text-text-secondary text-lg">Sin historial aún.</p>
        <p className="text-text-muted text-sm max-w-xs">
          Reproduce cualquier película o serie y aparecerá aquí.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Explorar contenido
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2">
        {(["all", "movie", "tv"] as const).map((f) => {
          const labels: Record<HistoryFilter, string> = {
            all: "Todo",
            movie: "Películas",
            tv: "Series",
          };
          const count = counts[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? "px-3.5 py-1.5 rounded-full text-xs font-medium bg-accent-primary text-white shadow-md shadow-accent-primary/30 transition-all"
                  : "px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-text-secondary hover:border-accent-primary/50 hover:text-text-primary transition-all"
              }
            >
              {labels[f]}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      <AnimatePresence initial={false} mode="popLayout">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => {
            const href =
              item.media_type === "movie"
                ? `/movie/${item.tmdb_id}`
                : `/tv/${item.tmdb_id}`;
            const posterUrl = getTMDBImageUrl(item.poster_path, "w342");
            const pct = item.duration_seconds > 0
              ? Math.min(100, Math.round((item.progress_seconds / item.duration_seconds) * 100))
              : 0;

            // Episode badge label for TV
            const epLabel =
              item.media_type === "tv" && item.season_number && item.episode_number
                ? `T${item.season_number}:E${item.episode_number}`
                : null;

            return (
              <motion.div
                key={`${item.media_type}-${item.tmdb_id}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <Link
                  href={href}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-xl"
                  aria-label={item.title}
                >
                  <div className="relative aspect-2/3 rounded-xl overflow-hidden bg-surface-hover">
                    <ImageWithFallback
                      src={posterUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

                    {/* Media type + episode badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      {item.media_type === "movie"
                        ? <Film className="w-3 h-3 text-white/80" />
                        : <Tv className="w-3 h-3 text-white/80" />}
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                        {epLabel ?? (item.media_type === "movie" ? "Película" : "Serie")}
                      </span>
                    </div>

                    {/* Completed / Progress badge */}
                    {item.completed ? (
                      <div className="absolute top-2 right-2 text-[9px] font-semibold bg-success/80 text-white px-1.5 py-0.5 rounded">
                        Visto
                      </div>
                    ) : item.release_year ? (
                      <div className="absolute top-2 right-2 text-[9px] font-semibold bg-black/60 text-white/80 px-1.5 py-0.5 rounded">
                        {item.release_year}
                      </div>
                    ) : null}
                  </div>
                </Link>

                {/* Progress bar */}
                {pct > 0 && !item.completed && (
                  <div className="mt-1.5 h-0.5 w-full rounded-full bg-surface-hover overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-1 mt-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary leading-snug line-clamp-2 group-hover:text-accent-hover transition-colors">
                      {item.title}
                    </p>
                    {item.total_watch_seconds > 60 && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {formatWatchTime(item.total_watch_seconds)}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="shrink-0 p-1 rounded-md text-text-muted hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar del historial"
                    aria-label={`Eliminar ${item.title} del historial`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
