// ─────────────────────────────────────────────────────────────────────────────
// Supabase browser client
// ─────────────────────────────────────────────────────────────────────────────
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when .env.local has been filled in with real Supabase credentials. */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_KEY.length > 20;

/**
 * Returns a Supabase browser client, or null if credentials are missing.
 * All lib functions check for null before making any network call.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): ReturnType<typeof createBrowserClient<any>> | null {
  if (!isSupabaseConfigured) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(SUPABASE_URL, SUPABASE_KEY);
}
