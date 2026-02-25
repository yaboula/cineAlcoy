"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useSmartSuggestions — TMDB recommendations weighted by the user's top genres
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useProfile } from "./useProfile";
import { getTopGenres, getPreferredGenreIds } from "@/lib/supabase/genres";
import { getContinueWatching, getWatchHistory } from "@/lib/supabase/watch-history";
import type { GenrePreference } from "@/lib/supabase/types";

interface SmartSuggestionsResult {
  topGenres: GenrePreference[];
  preferredGenreIds: number[];
  /** tmdb_ids already watched — use to exclude from recommendation lists */
  watchedIds: Set<number>;
  continueWatchingCount: number;
  loading: boolean;
}

export function useSmartSuggestions(): SmartSuggestionsResult {
  const { profile } = useProfile();
  const [topGenres, setTopGenres]             = useState<GenrePreference[]>([]);
  const [preferredGenreIds, setPreferredIds]  = useState<number[]>([]);
  const [watchedIds, setWatchedIds]           = useState<Set<number>>(new Set());
  const [continueWatchingCount, setCWCount]   = useState(0);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    if (!profile) return;

    Promise.all([
      getTopGenres(profile.id, 5),
      getPreferredGenreIds(profile.id),
      getWatchHistory(profile.id, 200),
      getContinueWatching(profile.id, 20),
    ]).then(([genres, genreIds, history, cw]) => {
      setTopGenres(genres);
      setPreferredIds(genreIds);
      setWatchedIds(new Set(history.map((h) => h.tmdb_id)));
      setCWCount(cw.length);
    }).finally(() => setLoading(false));
  }, [profile]);

  return { topGenres, preferredGenreIds, watchedIds, continueWatchingCount, loading };
}
