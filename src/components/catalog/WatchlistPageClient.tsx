"use client";

// ──────────────────────────────────────────────────
// WatchlistPageClient — /watchlist page
// Shows saved "Ver más tarde" items from Supabase.
// ──────────────────────────────────────────────────

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, BookmarkX, Film, Tv } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useWatchlist } from "@/hooks/useWatchlist";
import { getTMDBImageUrl } from "@/lib/utils";
import type { WatchlistRow } from "@/lib/supabase/types";
import { removeFromWatchlist } from "@/lib/supabase/watchlist";
import { useProfile } from "@/hooks/useProfile";

export default function WatchlistPageClient() {
  const { profile } = useProfile();
  const { items, loading, reload } = useWatchlist();

  async function handleRemove(item: WatchlistRow) {
    if (!profile) return;
    await removeFromWatchlist(profile.id, item.tmdb_id, item.media_type);
    reload();
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-2/3 rounded-xl bg-surface-hover animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
        <Bookmark className="w-12 h-12 text-text-muted opacity-40" />
        <p className="text-text-secondary text-lg">Tu lista está vacía.</p>
        <p className="text-text-muted text-sm max-w-xs">
          Pulsa el botón <strong>Guardar</strong> en cualquier película o serie para agregarla aquí.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2.5 rounded-full bg-accent-primary text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Explorar contenido
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-6">
        {items.map((item) => {
          const href = item.media_type === "movie" ? `/movie/${item.tmdb_id}` : `/tv/${item.tmdb_id}`;
          const posterUrl = getTMDBImageUrl(item.poster_path, "w342");

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

                  {/* Overlay with media type badge */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    {item.media_type === "movie"
                      ? <Film className="w-3 h-3 text-white/80" />
                      : <Tv className="w-3 h-3 text-white/80" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                      {item.media_type === "movie" ? "Película" : "Serie"}
                    </span>
                  </div>

                  {item.release_year && (
                    <div className="absolute top-2 right-2 text-[9px] font-semibold bg-black/60 text-white/80 px-1.5 py-0.5 rounded">
                      {item.release_year}
                    </div>
                  )}
                </div>
              </Link>

              <p className="mt-2 text-xs text-text-primary leading-snug line-clamp-2 group-hover:text-accent-hover transition-colors pr-6">
                {item.title}
              </p>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item)}
                className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/80 cursor-pointer"
                title="Quitar de Mi lista"
                aria-label={`Quitar ${item.title} de Mi lista`}
              >
                <BookmarkX className="w-3.5 h-3.5 text-white" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}
