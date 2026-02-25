"use server";

// ──────────────────────────────────────────────────
// Server Action — Live search suggestions
// Returns top 5 media items for autocomplete dropdown
// ──────────────────────────────────────────────────

import { searchMulti } from "@/lib/tmdb";
import type { MultiSearchResult } from "@/types";

export interface SearchSuggestion {
  id: number;
  title: string;
  year: string;
  type: "movie" | "tv";
  poster_path: string | null;
}

export async function fetchSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const data = await searchMulti(query.trim(), 1);
    return data.results
      .filter(
        (r: MultiSearchResult): r is MultiSearchResult & { media_type: "movie" | "tv" } =>
          r.media_type === "movie" || r.media_type === "tv"
      )
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.media_type === "movie" ? item.title : item.name,
        year:
          item.media_type === "movie"
            ? item.release_date?.substring(0, 4) ?? ""
            : item.first_air_date?.substring(0, 4) ?? "",
        type: item.media_type,
        poster_path: item.poster_path,
      }));
  } catch {
    return [];
  }
}
