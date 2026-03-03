// ──────────────────────────────────────────────────────────────────────────────
// Consumet / FlixHQ  —  server-side typed API client
//
// The FlixHQ provider does NOT accept TMDB IDs directly.  Resolution flow:
//   1. search(title)     → list of FlixHQ results (internal id like "movie/xxx")
//   2. fetchInfo(id)     → episode list with internal episodeIds
//   3. fetchSources(...)  → direct stream URLs (m3u8 / mp4)
//
// Set CONSUMET_API_URL in your environment to override the public instance.
// e.g. https://api.consumet.org  (default)  or  http://localhost:3001
// ──────────────────────────────────────────────────────────────────────────────

const BASE = (
  process.env.CONSUMET_API_URL ?? "https://api.consumet.org"
).replace(/\/$/, "");

const TIMEOUT_MS = 25_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: 3600 }, // cache 1h in Next.js data-cache
    });
    if (!res.ok) throw new Error(`Consumet ${res.status}: ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(tid);
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlixHQResult {
  id: string;          // e.g. "movie/avengers-endgame-123"
  title: string;
  type: "Movie" | "TV Series";
  releaseDate?: string;
  seasons?: number;
  image?: string;
}

export interface FlixHQSearchResponse {
  results: FlixHQResult[];
}

export interface FlixHQEpisode {
  id: string;          // numeric id used for fetchSources
  title?: string | null;
  number?: number | null;
  season?: number | null;
  url?: string;
}

export interface FlixHQInfo {
  id: string;
  title: string;
  type: "Movie" | "TV Series";
  episodes?: FlixHQEpisode[];
}

export interface StreamSource {
  url: string;
  quality?: string;
  isM3U8: boolean;
}

export interface StreamSubtitle {
  url: string;
  lang: string;
}

export interface StreamResponse {
  sources: StreamSource[];
  subtitles?: StreamSubtitle[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Search FlixHQ by title — returns up to 20 results */
export async function searchFlixHQ(query: string): Promise<FlixHQResult[]> {
  const encoded = encodeURIComponent(query);
  const data = await get<FlixHQSearchResponse>(
    `/movies/flixhq/${encoded}`
  );
  return data.results ?? [];
}

/** Fetch detailed info (incl. episode list) for a FlixHQ media id */
export async function fetchFlixHQInfo(flixhqId: string): Promise<FlixHQInfo> {
  const encoded = encodeURIComponent(flixhqId);
  return get<FlixHQInfo>(`/movies/flixhq/info?id=${encoded}`);
}

/** Fetch streaming sources for a given episode */
export async function fetchFlixHQSources(
  episodeId: string,
  mediaId: string
): Promise<StreamResponse> {
  const ep = encodeURIComponent(episodeId);
  const mid = encodeURIComponent(mediaId);
  return get<StreamResponse>(
    `/movies/flixhq/watch?episodeId=${ep}&mediaId=${mid}`
  );
}

// ── High-level resolver ───────────────────────────────────────────────────────

export interface ResolvedStream {
  url: string;
  isM3U8: boolean;
  quality: string;
  subtitles: StreamSubtitle[];
}

function normaliseTitle(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/**
 * Full resolution pipeline:
 *  1. Search by title
 *  2. Pick the best match for the given media type + release year
 *  3. Fetch info to get episodeId (for TV: match season + episode)
 *  4. Fetch sources — prefer highest quality m3u8, fallback to mp4
 */
export async function resolveStream(opts: {
  title: string;
  type: "movie" | "tv";
  releaseYear?: number | null;
  season?: number;   // TV only
  episode?: number;  // TV only
}): Promise<ResolvedStream> {
  const { title, type, releaseYear, season = 1, episode = 1 } = opts;

  // ── Step 1: Search ──────────────────────────────────────────────────────────
  const results = await searchFlixHQ(title);
  if (results.length === 0) throw new Error("No results found on FlixHQ");

  const expectedType = type === "movie" ? "Movie" : "TV Series";

  // Filter by media type, then score by title similarity
  const candidates = results.filter((r) => r.type === expectedType);
  if (candidates.length === 0) throw new Error(`No ${expectedType} found for "${title}"`);

  const normTarget = normaliseTitle(title);
  let best = candidates[0];
  let bestScore = 0;
  for (const c of candidates) {
    const normC = normaliseTitle(c.title);
    // Exact match
    if (normC === normTarget) { best = c; break; }
    // Prefix match
    const overlap = normC.startsWith(normTarget) || normTarget.startsWith(normC);
    // Year match bonus
    const yearBonus = releaseYear && c.releaseDate?.includes(String(releaseYear)) ? 2 : 0;
    const score = (overlap ? 3 : 0) + yearBonus;
    if (score > bestScore) { bestScore = score; best = c; }
  }

  // ── Step 2: Fetch info with episode list ────────────────────────────────────
  const info = await fetchFlixHQInfo(best.id);
  const episodes = info.episodes ?? [];
  if (episodes.length === 0) throw new Error("No episodes found in FlixHQ info");

  let targetEpisode: FlixHQEpisode;

  if (type === "movie") {
    // For movies there is exactly one "episode" entry
    targetEpisode = episodes[0];
  } else {
    // Find the episode matching season + episode number
    const found = episodes.find(
      (ep) => ep.season === season && ep.number === episode
    );
    if (!found) throw new Error(`Episode S${season}E${episode} not found on FlixHQ`);
    targetEpisode = found;
  }

  // ── Step 3: Fetch sources ───────────────────────────────────────────────────
  const streams = await fetchFlixHQSources(targetEpisode.id, best.id);
  const sources = streams.sources ?? [];
  if (sources.length === 0) throw new Error("No stream sources returned by FlixHQ");

  // Prefer 1080p m3u8, then best m3u8, then any mp4
  const sorted = [...sources].sort((a, b) => {
    const aScore =
      (a.isM3U8 ? 10 : 0) +
      (a.quality?.includes("1080") ? 5 : 0) +
      (a.quality?.includes("720") ? 3 : 0);
    const bScore =
      (b.isM3U8 ? 10 : 0) +
      (b.quality?.includes("1080") ? 5 : 0) +
      (b.quality?.includes("720") ? 3 : 0);
    return bScore - aScore;
  });

  const chosen = sorted[0];
  return {
    url: chosen.url,
    isM3U8: chosen.isM3U8,
    quality: chosen.quality ?? "auto",
    subtitles: streams.subtitles ?? [],
  };
}
