// ─────────────────────────────────────────────────────────────────────────────
// Profile — device-based identity (no login required)
// A UUID is created once in localStorage and used as the profile key.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { Profile } from "./types";

const DEVICE_ID_KEY = "cinema_device_id";

/** Get or create a persistent device UUID stored in localStorage */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** Get the current profile from Supabase, creating one if it doesn't exist */
export async function getOrCreateProfile(): Promise<Profile | null> {
  const deviceId = getDeviceId();
  if (!deviceId) return null;

  const supabase = createClient();

  // Try to fetch existing
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("device_id", deviceId)
    .single();

  if (existing) return existing as Profile;

  // Create new profile
  const { data: created } = await supabase
    .from("profiles")
    .insert({ device_id: deviceId, display_name: "Usuario", avatar_emoji: "🎬" })
    .select()
    .single();

  return created as Profile | null;
}

/** Update display name or avatar */
export async function updateProfile(
  profileId: string,
  changes: Partial<Pick<Profile, "display_name" | "avatar_emoji">>
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("profiles")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", profileId);
}
