"use client";

// ──────────────────────────────────────────────────
// SearchPageClient — handles pagination, filtering,
// and results display with Server Action for data
// ──────────────────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import MediaGrid from "@/components/catalog/MediaGrid";
import SearchResultCount from "@/components/catalog/SearchResultCount";
import EmptySearchState from "@/components/catalog/EmptySearchState";
import MediaTypeFilter, {
  type MediaFilter,
} from "@/components/catalog/MediaTypeFilter";
import SearchEmptyLanding from "@/components/catalog/SearchEmptyLanding";
import { saveSearchQuery } from "@/components/catalog/SearchEmptyLanding";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { searchMoreResults } from "@/app/actions/search-actions";
import type { MediaItem } from "@/types";

interface SearchPageClientProps {
  initialItems: MediaItem[];
  initialTotal: number;
  initialTotalPages: number;
  query: string;
  trendingSuggestions: MediaItem[];
}

export default function SearchPageClient({
  initialItems,
  initialTotal,
  initialTotalPages,
  query,
  trendingSuggestions,
}: SearchPageClientProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");

  // Save search query to history when results load
  useEffect(() => {
    if (query) saveSearchQuery(query);
  }, [query]);

  // Reset filter when query changes
  useEffect(() => {
    setMediaFilter("all");
  }, [query]);

  // ── Pagination via Server Action ──────────────
  async function loadMore() {
    if (isLoading || currentPage >= totalPages) return;
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await searchMoreResults(query, nextPage);
      setItems((prev) => [...prev, ...data.items]);
      setCurrentPage(nextPage);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }

  // ── Filter logic ──────────────────────────────
  const filteredItems = useMemo(() => {
    if (mediaFilter === "all") return items;
    return items.filter((item) => item.media_type === mediaFilter);
  }, [items, mediaFilter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      movie: items.filter((i) => i.media_type === "movie").length,
      tv: items.filter((i) => i.media_type === "tv").length,
    }),
    [items]
  );

  return (
    <div className="space-y-6">
      {query ? (
        <>
          {/* Result count */}
          <SearchResultCount count={initialTotal} query={query} />

          {/* Media type filter tabs */}
          {items.length > 0 && (
            <MediaTypeFilter
              active={mediaFilter}
              onChange={setMediaFilter}
              counts={counts}
            />
          )}

          {/* Results grid */}
          {filteredItems.length > 0 ? (
            <>
              <MediaGrid items={filteredItems} />
              {mediaFilter === "all" && (
                <LoadMoreButton
                  onClick={loadMore}
                  isLoading={isLoading}
                  hasMore={currentPage < totalPages}
                />
              )}
            </>
          ) : items.length > 0 ? (
            /* Has results but filtered to 0 */
            <div className="flex flex-col items-center justify-center py-16 text-text-muted animate-fadeIn">
              <p className="text-sm">
                No hay {mediaFilter === "movie" ? "películas" : "series"} en los
                resultados cargados.
              </p>
            </div>
          ) : (
            <EmptySearchState query={query} />
          )}
        </>
      ) : (
        /* Empty query — landing with trending + history */
        <SearchEmptyLanding trending={trendingSuggestions} />
      )}
    </div>
  );
}
