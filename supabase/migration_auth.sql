-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: device_id → Supabase Auth (user_id)
-- Run this AFTER the app is deployed with auth support.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Add user_id column to profiles (nullable first for migration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Drop old device_id constraint (keep column for data migration if needed)
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_device_id_key;

-- Step 3: Make user_id unique and NOT NULL after data migration
-- ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Step 4: Drop old open policies
DROP POLICY IF EXISTS "open_profiles"           ON profiles;
DROP POLICY IF EXISTS "open_watch_history"      ON watch_history;
DROP POLICY IF EXISTS "open_watchlist"          ON watchlist;
DROP POLICY IF EXISTS "open_user_stats"         ON user_stats;
DROP POLICY IF EXISTS "open_genre_preferences"  ON genre_preferences;

-- Step 5: Create proper auth-based RLS policies
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "watch_history_all_own" ON watch_history FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "watchlist_all_own" ON watchlist FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "user_stats_all_own" ON user_stats FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "genre_prefs_all_own" ON genre_preferences FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Step 6: Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_emoji)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Usuario'), '🎬');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
