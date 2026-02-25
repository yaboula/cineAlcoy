"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useWatchlist — add/remove items from "Ver más tarde"
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { useProfile } from "./useProfile";
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getWatchlist,
} from "@/lib/supabase/watchlist";
import type { WatchlistRow, MediaType } from "@/lib/supabase/types";

export function useWatchlistStatus(tmdbId: number, mediaType: MediaType) {
  const { profile } = useProfile();
  const [inList, setInList] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!profile) return;
    isInWatchlist(profile.id, tmdbId, mediaType).then(setInList);
  }, [profile, tmdbId, mediaType]);

  const toggle = useCallback(
    async (itemData: {
      title: string;
      posterPath?: string | null;
      backdropPath?: string | null;
      genreIds?: number[];
      releaseYear?: number | null;
    }) => {
      if (!profile || toggling) return;
      setToggling(true);
      try {
        if (inList) {
          await removeFromWatchlist(profile.id, tmdbId, mediaType);
          setInList(false);
        } else {
          await addToWatchlist({ profileId: profile.id, tmdbId, mediaType, ...itemData });
          setInList(true);
        }
      } finally {
        setToggling(false);
      }
    },
    [profile, tmdbId, mediaType, inList, toggling]
  );

  return { inList, toggling, toggle };
}

export function useWatchlist() {
  const { profile } = useProfile();
  const [items, setItems] = useState<WatchlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const data = await getWatchlist(profile.id);
    setItems(data);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    getWatchlist(profile.id).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [profile]);

  return { items, loading, reload };
}
