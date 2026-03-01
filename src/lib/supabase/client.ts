// ─────────────────────────────────────────────────────────────────────────────
// Supabase browser client — singleton for client components
// ─────────────────────────────────────────────────────────────────────────────
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when .env.local has been filled in with real Supabase credentials. */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_KEY.length > 20;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: ReturnType<typeof createBrowserClient<any>> | null = null;

/**
 * Returns a Supabase browser client (singleton), or null if credentials are missing.
 * The singleton ensures auth state is shared across all hooks/components.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): ReturnType<typeof createBrowserClient<any>> | null {
  if (!isSupabaseConfigured) return null;
  if (!_client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _client = createBrowserClient<any>(SUPABASE_URL, SUPABASE_KEY);
  }
  return _client;
}
