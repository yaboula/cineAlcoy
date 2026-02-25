// ──────────────────────────────────────────────────
// Cinema App — TMDB Base Fetcher
// ──────────────────────────────────────────────────

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY is not defined. Add it to your .env.local file."
    );
  }
  return key;
}

export class TMDBError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "TMDBError";
  }
}

interface FetchOptions {
  revalidate?: number | false;
  cache?: RequestCache;
}

/**
 * Central fetch wrapper for all TMDB API calls.
 * - Automatically injects the API key
 * - Applies cache/revalidation strategy
 * - Throws typed errors on failure
 */
export async function tmdbFetch<T>(
  endpoint: string,
  params?: Record<string, string | number>,
  options: FetchOptions = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  // Always include api_key and language
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "es-ES");

  // Append additional query params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  // Default: revalidate every hour
  const { revalidate = 3600, cache } = options;

  const fetchOptions: RequestInit & { next?: { revalidate: number | false } } = {};

  if (cache) {
    fetchOptions.cache = cache;
  } else if (revalidate !== undefined) {
    fetchOptions.next = { revalidate };
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    throw new TMDBError(
      `TMDB API error: ${response.status} ${response.statusText}`,
      response.status,
      endpoint
    );
  }

  const data: T = await response.json();
  return data;
}
