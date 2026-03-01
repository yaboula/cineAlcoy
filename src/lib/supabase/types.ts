// 
// Supabase Database types
// Matches the exact shape createBrowserClient<Database> expects.
// 

export type MediaType = "movie" | "tv";

//  Row shapes (what SELECT returns) 
export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string;
  avatar_emoji: string;
  created_at: string;
  updated_at: string;
}

export interface WatchHistoryRow {
  id: string;
  profile_id: string;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  release_year: number | null;
  progress_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  completed: boolean;
  season_number: number | null;
  episode_number: number | null;
  episode_title: string | null;
  first_watched_at: string;
  last_watched_at: string;
  total_watch_seconds: number;
}

export interface WatchlistRow {
  id: string;
  profile_id: string;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  release_year: number | null;
  added_at: string;
}

export interface UserStats {
  profile_id: string;
  total_watch_seconds: number;
  movies_completed: number;
  episodes_completed: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface GenrePreference {
  profile_id: string;
  genre_id: number;
  genre_name: string;
  watch_count: number;
  completed_count: number;
}

//  Database generic (exact format Supabase TS client expects) 
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row:    Profile;
        Insert: { user_id: string; email?: string; display_name?: string; avatar_emoji?: string };
        Update: { display_name?: string; avatar_emoji?: string; email?: string; updated_at?: string };
      };
      watch_history: {
        Row:    WatchHistoryRow;
        Insert: Omit<WatchHistoryRow, "id" | "progress_percent">;
        Update: Partial<Omit<WatchHistoryRow, "id" | "profile_id" | "progress_percent">>;
      };
      watchlist: {
        Row:    WatchlistRow;
        Insert: Omit<WatchlistRow, "id">;
        Update: Partial<Omit<WatchlistRow, "id" | "profile_id">>;
      };
      user_stats: {
        Row:    UserStats;
        Insert: Omit<UserStats, "updated_at">;
        Update: Partial<Omit<UserStats, "profile_id">>;
      };
      genre_preferences: {
        Row:    GenrePreference;
        Insert: GenrePreference;
        Update: Partial<Pick<GenrePreference, "watch_count" | "completed_count" | "genre_name">>;
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
};
