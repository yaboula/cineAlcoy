"use client";

// 
// ContinueWatchingRow  Sprint 9  updated Sprint 12
// Shows in-progress items from Supabase watch history.
// Hidden when there are no items.
// 

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useProfileContext } from "@/components/providers/ProfileProvider";
import { getContinueWatching } from "@/lib/supabase/watch-history";
import { getTMDBImageUrl } from "@/lib/utils";
import type { WatchHistoryRow } from "@/lib/supabase/types";

export default function ContinueWatchingRow() {
  const { profile, loading: profileLoading } = useProfileContext();
  const [items, setItems] = useState<WatchHistoryRow[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    getContinueWatching(profile.id, 20)
      .then(setItems)
      .catch(() => { /* Supabase unavailable — show nothing */ });
  }, [profile]);

  // Don''t render until client hydration is complete or while loading
  if (!mounted || profileLoading || items.length === 0) return null;

  return (
    <section aria-label="Continuar viendo">
      <h2 className="text-xl font-bold text-text-primary tracking-tight mb-5 pl-3 border-l-2 border-accent-primary">
        Continuar viendo
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {items.map((item) => {
          const href = item.media_type === "movie" ? `/movie/${item.tmdb_id}` : `/tv/${item.tmdb_id}`;
          const posterUrl = getTMDBImageUrl(item.poster_path, "w185");
          const pct =
            item.duration_seconds > 0
              ? Math.min(100, Math.round((item.progress_seconds / item.duration_seconds) * 100))
              : 0;

          return (
            <Link
              key={`${item.media_type}-${item.tmdb_id}`}
              href={href}
              className="shrink-0 w-28 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-lg"
              aria-label={`Continuar: ${item.title}`}
            >
              <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-surface-hover transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-black/40">
                <ImageWithFallback
                  src={posterUrl}
                  alt={item.title}
                  fill
                  sizes="112px"
                />

                {/* Type badge */}
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent px-2 py-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                    {item.media_type === "movie" ? "Película" : "Serie"}
                  </span>
                </div>

                {/* Play icon overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {pct > 0 && (
                <div className="mt-1.5 h-0.5 w-full rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}

              <p className="mt-1.5 text-xs text-text-primary leading-snug line-clamp-2 group-hover:text-accent-hover transition-colors">
                {item.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
