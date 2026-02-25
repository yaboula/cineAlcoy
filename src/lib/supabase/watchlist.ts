// ─────────────────────────────────────────────────────────────────────────────
// Watchlist — "Watch Later" / Favorites
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { WatchlistRow, MediaType } from "./types";

export interface WatchlistInput {
  profileId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  genreIds?: number[];
  releaseYear?: number | null;
}

export async function addToWatchlist(input: WatchlistInput): Promise<void> {
  const supabase = createClient();
  await supabase.from("watchlist").upsert(
    {
      profile_id:   input.profileId,
      tmdb_id:      input.tmdbId,
      media_type:   input.mediaType,
      title:        input.title,
      poster_path:  input.posterPath   ?? null,
      backdrop_path: input.backdropPath ?? null,
      genre_ids:    input.genreIds     ?? [],
      release_year: input.releaseYear  ?? null,
      added_at:     new Date().toISOString(),
    },
    { onConflict: "profile_id,tmdb_id,media_type" }
  );
}

export async function removeFromWatchlist(
  profileId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("watchlist")
    .delete()
    .eq("profile_id", profileId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);
}

export async function isInWatchlist(
  profileId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("profile_id", profileId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .single();
  return !!data;
}

export async function getWatchlist(
  profileId: string,
  limit = 100
): Promise<WatchlistRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("*")
    .eq("profile_id", profileId)
    .order("added_at", { ascending: false })
    .limit(limit);
  return (data as WatchlistRow[]) ?? [];
}
