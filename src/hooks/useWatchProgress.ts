"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useWatchProgress — save + restore exact play position
//
// Usage in VideoPlayer/TVPlayerSection:
//   const { progressSeconds, saveProgress } = useWatchProgress({...})
//   Call saveProgress(currentSeconds) every 10 s + on pause/unmount
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { useProfile } from "./useProfile";
import {
  saveProgress as dbSaveProgress,
  getProgress,
} from "@/lib/supabase/watch-history";
import { updateStats } from "@/lib/supabase/stats";
import { recordGenres, TMDB_GENRE_NAMES } from "@/lib/supabase/genres";
import type { MediaType } from "@/lib/supabase/types";

interface UseWatchProgressOptions {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  genreIds?: number[];
  releaseYear?: number | null;
  durationSeconds?: number;
  // TV only
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
}

export function useWatchProgress(opts: UseWatchProgressOptions) {
  const { profile } = useProfile();
  const [resumeFrom, setResumeFrom] = useState<number>(0);
  const [loadedProgress, setLoadedProgress] = useState(false);
  const lastSavedRef = useRef<number>(0);

  // Load saved position on mount
  useEffect(() => {
    if (!profile) return;
    getProgress(profile.id, opts.tmdbId, opts.mediaType).then((row) => {
      if (row && !row.completed && row.progress_seconds > 30) {
        // For TV: only resume if we're on the SAME episode that was saved.
        // Otherwise the user switched episodes and we shouldn't resume.
        if (
          opts.mediaType === "tv" &&
          (row.season_number !== (opts.seasonNumber ?? null) ||
           row.episode_number !== (opts.episodeNumber ?? null))
        ) {
          // Different episode — don't resume, but mark as loaded
          setLoadedProgress(true);
          return;
        }
        setResumeFrom(row.progress_seconds);
      }
      setLoadedProgress(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, opts.tmdbId, opts.mediaType, opts.seasonNumber, opts.episodeNumber]);

  const saveProgress = useCallback(
    async (currentSeconds: number, completed = false) => {
      if (!profile) return;

      const delta = currentSeconds - lastSavedRef.current;
      if (!completed && delta < 8) return; // minimum 8 s between saves

      lastSavedRef.current = currentSeconds;

      await dbSaveProgress({
        profileId:       profile.id,
        tmdbId:          opts.tmdbId,
        mediaType:       opts.mediaType,
        title:           opts.title,
        posterPath:      opts.posterPath,
        backdropPath:    opts.backdropPath,
        genreIds:        opts.genreIds ?? [],
        releaseYear:     opts.releaseYear,
        progressSeconds: currentSeconds,
        durationSeconds: opts.durationSeconds,
        completed,
        seasonNumber:    opts.seasonNumber,
        episodeNumber:   opts.episodeNumber,
        episodeTitle:    opts.episodeTitle,
      });

      // Update stats (add delta seconds)
      await updateStats(profile.id, {
        addSeconds:       delta > 0 ? delta : 0,
        completedMovie:   completed && opts.mediaType === "movie",
        completedEpisode: completed && opts.mediaType === "tv",
      });

      // Record genre preferences
      if (opts.genreIds?.length) {
        await recordGenres(profile.id, opts.genreIds, TMDB_GENRE_NAMES, completed);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile?.id, opts.tmdbId, opts.mediaType, opts.seasonNumber, opts.episodeNumber]
  );

  return { resumeFrom, loadedProgress, saveProgress };
}
