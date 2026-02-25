"use client";

// ──────────────────────────────────────────────────
// WatchHistorySaver — Invisible client component
// Saves current media to localStorage on mount (Sprint 8)
// ──────────────────────────────────────────────────

import { useEffect } from "react";
import { WATCH_HISTORY_KEY, WATCH_HISTORY_MAX_ITEMS } from "@/types";
import type { WatchHistoryItem } from "@/types";

interface WatchHistorySaverProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  type: "movie" | "tv";
}

export default function WatchHistorySaver({
  tmdbId,
  title,
  posterPath,
  type,
}: WatchHistorySaverProps) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WATCH_HISTORY_KEY);
      let history: WatchHistoryItem[] = [];

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) history = parsed;
      }

      // Remove existing entry for this item (deduplication)
      history = history.filter((h) => !(h.tmdb_id === tmdbId && h.type === type));

      // Prepend new item
      const newItem: WatchHistoryItem = {
        tmdb_id: tmdbId,
        title,
        poster_path: posterPath,
        type,
        timestamp: Date.now(),
      };
      history.unshift(newItem);

      // Enforce max limit (FIFO)
      if (history.length > WATCH_HISTORY_MAX_ITEMS) {
        history = history.slice(0, WATCH_HISTORY_MAX_ITEMS);
      }

      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // localStorage unavailable (SSR guard or private browsing) — fail silently
    }
  }, [tmdbId, type, title, posterPath]);

  return null;
}
