// ─────────────────────────────────────────────────────────────────────────────
// Supabase browser client
// ─────────────────────────────────────────────────────────────────────────────
import { createBrowserClient } from "@supabase/ssr";

// Using `any` as the Database generic lets TypeScript skip strict table-type
// inference (which produces `never` errors with newer PostgREST schemas).
// All query results are explicitly cast to the correct types in each lib file.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
