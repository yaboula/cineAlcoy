// ──────────────────────────────────────────────────
// useWatchHistory — localStorage watch history hook
// Sprint 9
// ──────────────────────────────────────────────────

"use client";

import { useState, useCallback, useEffect } from "react";
import { WATCH_HISTORY_KEY, WATCH_HISTORY_MAX_ITEMS } from "@/types";
import type { WatchHistoryItem } from "@/types";

function readHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic schema validation
    return parsed.filter(
      (h): h is WatchHistoryItem =>
        typeof h?.tmdb_id === "number" &&
        typeof h?.title === "string" &&
        (h.type === "movie" || h.type === "tv")
    );
  } catch {
    return [];
  }
}

function writeHistory(history: WatchHistoryItem[]): void {
  try {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Fail silently (private browsing / storage full)
  }
}

export function useWatchHistory() {
  const [isMounted, setIsMounted] = useState(false);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Hydration guard — only read localStorage on client
  useEffect(() => {
    const stored = readHistory();
    setIsMounted(true);
    setHistory(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getHistory = useCallback((): WatchHistoryItem[] => {
    if (!isMounted) return [];
    return readHistory();
  }, [isMounted]);

  const addToHistory = useCallback((item: WatchHistoryItem): void => {
    let current = readHistory();
    // Deduplicate
    current = current.filter(
      (h) => !(h.tmdb_id === item.tmdb_id && h.type === item.type)
    );
    current.unshift(item);
    if (current.length > WATCH_HISTORY_MAX_ITEMS) {
      current = current.slice(0, WATCH_HISTORY_MAX_ITEMS);
    }
    writeHistory(current);
    setHistory(current);
  }, []);

  const removeFromHistory = useCallback((tmdbId: number): void => {
    const current = readHistory().filter((h) => h.tmdb_id !== tmdbId);
    writeHistory(current);
    setHistory(current);
  }, []);

  const clearHistory = useCallback((): void => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return { history, isMounted, getHistory, addToHistory, removeFromHistory, clearHistory };
}
