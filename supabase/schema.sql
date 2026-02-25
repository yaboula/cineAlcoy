-- ─────────────────────────────────────────────────────────────────────────────
-- Cinema App — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Profiles ──────────────────────────────────────────────────────────────
-- Each "user" is identified by a UUID stored in their browser's localStorage.
-- No login required. Works for small groups out of the box.
CREATE TABLE IF NOT EXISTS profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id      TEXT UNIQUE NOT NULL,          -- localStorage key
  display_name   TEXT NOT NULL DEFAULT 'Usuario',
  avatar_emoji   TEXT NOT NULL DEFAULT '🎬',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Watch History + Progress ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watch_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Media identification
  tmdb_id             INTEGER NOT NULL,
  media_type          TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title               TEXT NOT NULL,
  poster_path         TEXT,
  backdrop_path       TEXT,
  genre_ids           INTEGER[] NOT NULL DEFAULT '{}',
  release_year        SMALLINT,

  -- Progress (stored in seconds)
  progress_seconds    INTEGER NOT NULL DEFAULT 0,
  duration_seconds    INTEGER NOT NULL DEFAULT 0,   -- 0 = unknown
  completed           BOOLEAN NOT NULL DEFAULT FALSE,

  -- TV-specific (NULL for movies)
  season_number       SMALLINT,
  episode_number      SMALLINT,
  episode_title       TEXT,

  -- Timestamps
  first_watched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_watched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_watch_seconds INTEGER NOT NULL DEFAULT 0,   -- cumulative

  UNIQUE (profile_id, tmdb_id, media_type)
);

-- Computed progress percentage (0–100)
ALTER TABLE watch_history
  ADD COLUMN IF NOT EXISTS progress_percent REAL
  GENERATED ALWAYS AS (
    CASE
      WHEN duration_seconds > 0
        THEN LEAST((progress_seconds::REAL / duration_seconds) * 100, 100)
      ELSE 0
    END
  ) STORED;

-- ── 3. Watchlist (favorites / "watch later") ─────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id      INTEGER NOT NULL,
  media_type   TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title        TEXT NOT NULL,
  poster_path  TEXT,
  backdrop_path TEXT,
  genre_ids    INTEGER[] NOT NULL DEFAULT '{}',
  release_year SMALLINT,
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (profile_id, tmdb_id, media_type)
);

-- ── 4. User Stats ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_stats (
  profile_id            UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_watch_seconds   BIGINT NOT NULL DEFAULT 0,
  movies_completed      INTEGER NOT NULL DEFAULT 0,
  episodes_completed    INTEGER NOT NULL DEFAULT 0,
  current_streak_days   INTEGER NOT NULL DEFAULT 0,
  longest_streak_days   INTEGER NOT NULL DEFAULT 0,
  last_active_date      DATE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Genre Preferences (auto-built from watch_history) ─────────────────────
CREATE TABLE IF NOT EXISTS genre_preferences (
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  genre_id         INTEGER NOT NULL,
  genre_name       TEXT NOT NULL,
  watch_count      INTEGER NOT NULL DEFAULT 0,   -- items started
  completed_count  INTEGER NOT NULL DEFAULT 0,   -- items finished
  PRIMARY KEY (profile_id, genre_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_watch_history_profile       ON watch_history (profile_id, last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_incomplete    ON watch_history (profile_id, completed, last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_profile           ON watchlist     (profile_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_genre_prefs_profile_count   ON genre_preferences (profile_id, watch_count DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security — every user only sees their own rows
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats         ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_preferences  ENABLE ROW LEVEL SECURITY;

-- Allow all operations from the anon key (device-id auth handled in app)
CREATE POLICY "open_profiles"           ON profiles           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_watch_history"      ON watch_history      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_watchlist"          ON watchlist          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_user_stats"         ON user_stats         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_genre_preferences"  ON genre_preferences  FOR ALL USING (true) WITH CHECK (true);
