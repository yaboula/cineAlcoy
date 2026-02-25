"use client";

// ──────────────────────────────────────────────────
// ContinueWatchingRow — Sprint 9
// Shows items from localStorage watch history.
// Hidden when history is empty.
// ──────────────────────────────────────────────────

import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { getTMDBImageUrl } from "@/lib/utils";

export default function ContinueWatchingRow() {
  const { history, isMounted } = useWatchHistory();

  // Don't render until client hydration is complete
  if (!isMounted || history.length === 0) return null;

  return (
    <section aria-label="Continuar viendo">
      <h2 className="text-xl font-bold text-text-primary tracking-tight mb-5 pl-3 border-l-2 border-accent-primary">
        Continuar viendo
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {history.map((item) => {
          const href = item.type === "movie" ? `/movie/${item.tmdb_id}` : `/tv/${item.tmdb_id}`;
          const posterUrl = getTMDBImageUrl(item.poster_path, "w185");
          return (
            <Link
              key={`${item.type}-${item.tmdb_id}`}
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
                    {item.type === "movie" ? "Película" : "Serie"}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-text-primary leading-snug line-clamp-2 group-hover:text-accent-hover transition-colors">
                {item.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
