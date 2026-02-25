"use client";

// ──────────────────────────────────────────────────
// SearchEmptyLanding — Enhanced empty search state
// Shows trending suggestions + recent search history
// ──────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, X, Search } from "lucide-react";
import MediaCard from "@/components/catalog/MediaCard";
import type { MediaItem } from "@/types";

const SEARCH_HISTORY_KEY = "cinema_search_history";
const MAX_HISTORY = 5;

interface SearchEmptyLandingProps {
  trending: MediaItem[];
}

function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save a query to search history (deduplicated, max 5). */
export function saveSearchQuery(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const history = getSearchHistory().filter(
      (q) => q.toLowerCase() !== query.trim().toLowerCase()
    );
    history.unshift(query.trim());
    localStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(history.slice(0, MAX_HISTORY))
    );
  } catch {
    // Silently fail
  }
}

export default function SearchEmptyLanding({
  trending,
}: SearchEmptyLandingProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  function removeHistoryItem(query: string) {
    const updated = history.filter(
      (q) => q.toLowerCase() !== query.toLowerCase()
    );
    setHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }

  function searchQuery(query: string) {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ── Search History ────────────────────────── */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                <Clock className="w-4 h-4 text-text-muted" aria-hidden />
                Búsquedas recientes
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-text-muted hover:text-destructive transition-colors"
              >
                Borrar todo
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((query) => (
                <motion.div
                  key={query}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-surface border border-border hover:border-accent-primary/40 transition-all duration-200 cursor-pointer"
                >
                  <button
                    onClick={() => searchQuery(query)}
                    className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Search className="w-3 h-3" aria-hidden />
                    {query}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(query);
                    }}
                    className="p-0.5 rounded-full text-text-muted hover:text-destructive hover:bg-destructive/10 transition-all"
                    aria-label={`Eliminar "${query}" del historial`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Trending Suggestions ──────────────────── */}
      {trending.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary mb-4">
            <TrendingUp className="w-4 h-4 text-accent-primary" aria-hidden />
            Tendencias
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.slice(0, 6).map((item) => (
              <div key={`${item.media_type}-${item.id}`}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Fallback if nothing to show ───────────── */}
      {history.length === 0 && trending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
          <Search className="w-14 h-14" strokeWidth={0.8} aria-hidden />
          <p className="text-sm">
            Escribe el nombre de una película o serie...
          </p>
        </div>
      )}
    </div>
  );
}
