// /api/stream — direct Consumet/FlixHQ stream resolver (no external server)
//
// Uses @consumet/extensions locally — no Railway / external API needed.
//
// Query params:
//   tmdbId   number   required
//   type     string   required — "movie" | "tv"
//   season   number   optional (TV, default 1)
//   episode  number   optional (TV, default 1)

import { NextRequest, NextResponse } from "next/server";
// Import FlixHQ directly to avoid bundling anime providers that depend on
// got-scraping (ESM-only), which breaks Turbopack / Vercel builds.
import FlixHQ from "@consumet/extensions/dist/providers/movies/flixhq";
import type { IMovieResult } from "@consumet/extensions/dist/models";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── TMDB: fetch original (English) title ─────────────────────────────────────
async function fetchOriginalTitle(
  tmdbId: number,
  type: "movie" | "tv"
): Promise<{ title: string; year: number | null }> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");
  const url =
    type === "movie"
      ? `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=en-US`
      : `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=en-US`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const d = await res.json();
  const title: string =
    d.original_title ?? d.original_name ?? d.title ?? d.name ?? "";
  const yearStr: string = (d.release_date ?? d.first_air_date ?? "").slice(0, 4);
  return { title, year: yearStr ? parseInt(yearStr, 10) : null };
}

// ── Title helpers ─────────────────────────────────────────────────────────────
function normalise(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}
function simplify(t: string) {
  return t.split(/:\s| - /)[0].trim();
}

// ── FlixHQ resolver (runs locally via @consumet/extensions) ──────────────────
async function resolveWithFlixHQ(opts: {
  title: string;
  type: "movie" | "tv";
  year: number | null;
  season: number;
  episode: number;
}) {
  const { title, type, year, season, episode } = opts;
  const flixhq = new FlixHQ();

  const queries = [title, simplify(title)].filter(
    (q, i, arr) => arr.indexOf(q) === i
  );

  let best: IMovieResult | null = null;

  for (const query of queries) {
    const { results } = await flixhq.search(query);
    const expectedType = type === "movie" ? "Movie" : "TV Series";
    const candidates = results.filter((r) => r.type === expectedType);
    if (candidates.length === 0) continue;

    const normTarget = normalise(title);
    for (const c of candidates) {
      const rawTitle = c.title;
      const titleStr = typeof rawTitle === "string" ? rawTitle : (rawTitle as { userPreferred?: string })?.userPreferred ?? "";
      const normC = normalise(titleStr);
      const yearMatch =
        year &&
        String((c as IMovieResult & { releaseDate?: string }).releaseDate ?? "").includes(
          String(year)
        );
      if (normC === normTarget) { best = c; break; }
      if (!best) best = c;
      if (yearMatch) best = c;
    }
    if (best) break;
  }

  if (!best) throw new Error(`"${title}" not found on FlixHQ`);

  const info = await flixhq.fetchMediaInfo(best.id);
  const episodes = info.episodes ?? [];
  if (episodes.length === 0) throw new Error("No episodes in FlixHQ info");

  let epId: string;
  if (type === "movie") {
    epId = episodes[0].id;
  } else {
    const found = episodes.find(
      (ep) => ep.season === season && ep.number === episode
    );
    if (!found) throw new Error(`S${season}E${episode} not found on FlixHQ`);
    epId = found.id;
  }

  return flixhq.fetchEpisodeSources(epId, best.id);
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tmdbIdRaw = searchParams.get("tmdbId");
  const typeRaw = searchParams.get("type");
  const season = parseInt(searchParams.get("season") ?? "1", 10);
  const episode = parseInt(searchParams.get("episode") ?? "1", 10);

  if (!tmdbIdRaw || isNaN(Number(tmdbIdRaw)))
    return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
  if (typeRaw !== "movie" && typeRaw !== "tv")
    return NextResponse.json({ error: "type must be movie or tv" }, { status: 400 });

  const tmdbId = parseInt(tmdbIdRaw, 10);
  const type = typeRaw as "movie" | "tv";

  let title: string, year: number | null;
  try {
    ({ title, year } = await fetchOriginalTitle(tmdbId, type));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TMDB lookup failed" },
      { status: 502 }
    );
  }

  try {
    const source = await resolveWithFlixHQ({ title, type, year, season, episode });

    const sources = (source.sources ?? []).sort((a, b) => {
      const score = (s: typeof a) =>
        (s.isM3U8 ? 10 : 0) +
        (s.quality?.includes("1080") ? 5 : 0) +
        (s.quality?.includes("720") ? 3 : 0);
      return score(b) - score(a);
    });

    if (sources.length === 0) throw new Error("No stream sources returned");

    const pick = sources[0];
    return NextResponse.json(
      {
        url: pick.url,
        isM3U8: pick.isM3U8 ?? false,
        quality: pick.quality ?? "auto",
        subtitles: source.subtitles ?? [],
      },
      { headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/stream]", msg, { title, tmdbId });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

