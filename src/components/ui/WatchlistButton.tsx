"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WatchlistButton — heart/bookmark toggle for any MediaCard or detail page
// ─────────────────────────────────────────────────────────────────────────────

import { Bookmark, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWatchlistStatus } from "@/hooks/useWatchlist";
import type { MediaType } from "@/lib/supabase/types";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  genreIds?: number[];
  releaseYear?: number | null;
  /** "icon" = icon-only button; "pill" = labelled pill button */
  variant?: "icon" | "pill";
  className?: string;
}

export default function WatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  genreIds,
  releaseYear,
  variant = "icon",
  className,
}: WatchlistButtonProps) {
  const { inList, toggling, toggle } = useWatchlistStatus(tmdbId, mediaType);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({ title, posterPath, backdropPath, genreIds, releaseYear });
  }

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        disabled={toggling}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all duration-200",
          inList
            ? "bg-accent-primary/15 border-accent-primary/40 text-accent-primary hover:bg-accent-primary/20"
            : "bg-surface/80 border-border text-text-secondary hover:border-accent-primary/40 hover:text-text-primary",
          toggling && "opacity-60 pointer-events-none",
          className
        )}
        aria-label={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {inList ? (
            <motion.span key="in" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
              <BookmarkCheck className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span key="out" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bookmark className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
        {inList ? "En Mi Lista" : "Mi Lista"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggling}
      className={cn(
        "p-2 rounded-full transition-all duration-200",
        inList
          ? "bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30"
          : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white",
        toggling && "opacity-60 pointer-events-none",
        className
      )}
      aria-label={inList ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {inList ? (
          <motion.span key="in" initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ duration: 0.15 }}>
            <BookmarkCheck className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span key="out" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} transition={{ duration: 0.15 }}>
            <Bookmark className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
