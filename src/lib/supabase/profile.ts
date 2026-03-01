// ─────────────────────────────────────────────────────────────────────────────
// Profile — fetches/manages the profile linked to a Supabase Auth user
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { Profile } from "./types";

/**
 * Fetch the profile for an authenticated user.
 * The profile row is auto-created by a Postgres trigger on signup,
 * so this should always find a row for valid user IDs.
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) {
    console.warn("[Profile] Supabase client is null");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[Profile] Error fetching profile:", error.message, error.code);
    return null;
  }

  return data as Profile;
}

/** Update display name, avatar or email on the profile */
export async function updateProfile(
  profileId: string,
  changes: Partial<Pick<Profile, "display_name" | "avatar_emoji">>
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  await supabase
    .from("profiles")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", profileId);
}
