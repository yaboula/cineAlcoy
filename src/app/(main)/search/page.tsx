// ──────────────────────────────────────────────────
// /search — Search Page
// ──────────────────────────────────────────────────

import type { Metadata } from "next";
import { searchMulti, getTrending } from "@/lib/tmdb";
import type { MediaItem, MultiSearchResult, TrendingResult } from "@/types";
import SearchPageClient from "@/components/catalog/SearchPageClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Buscar "${q}" — Cinema` : "Búsqueda — Cinema",
    description: q ? `Resultados de búsqueda para "${q}" en Cinema.` : "Busca películas y series en Cinema.",
  };
}

function filterMediaItems(results: MultiSearchResult[]): MediaItem[] {
  return results.filter(
    (r): r is MediaItem => r.media_type === "movie" || r.media_type === "tv"
  );
}

function trendingToMediaItems(results: TrendingResult[]): MediaItem[] {
  return results.filter(
    (r): r is MediaItem => r.media_type === "movie" || r.media_type === "tv"
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let initialItems: MediaItem[] = [];
  let initialTotal = 0;
  let initialTotalPages = 0;
  let trendingSuggestions: MediaItem[] = [];

  if (query) {
    try {
      const data = await searchMulti(query, 1);
      initialItems = filterMediaItems(data.results);
      initialTotal = data.total_results;
      initialTotalPages = data.total_pages;
    } catch {
      // Will show empty state
    }
  } else {
    // Fetch trending for empty-state landing
    try {
      const data = await getTrending("all", "week");
      trendingSuggestions = trendingToMediaItems(data.results);
    } catch {
      // Will show fallback empty state
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-12">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Buscar</h1>
        <SearchPageClient
          initialItems={initialItems}
          initialTotal={initialTotal}
          initialTotalPages={initialTotalPages}
          query={query}
          trendingSuggestions={trendingSuggestions}
        />
      </div>
    </div>
  );
}
