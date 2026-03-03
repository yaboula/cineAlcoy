// /api/stream — server-side Consumet/FlixHQ stream resolver
//
// Query params:
//   tmdbId   number   required — TMDB media id
//   type     string   required — "movie" | "tv"
//   season   number   optional — season number   (TV only, default 1)
//   episode  number   optional — episode number  (TV only, default 1)
//
// The server fetches original_title from TMDB (always English) so FlixHQ
// search works regardless of the user's locale.
//
// Returns { url, isM3U8, quality, subtitles } on success
//         { error: string }                   on failure

import { NextRequest, NextResponse } from "next/server";
import { resolveStream } from "@/lib/consumet/client";

export const runtime = "nodejs";
export const maxDuration = 60;

async function fetchOriginalTitle(
  tmdbId: number,
  type: "movie" | "tv"
): Promise<{ title: string; year: number | null }> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not configured");

  const endpoint =
    type === "movie"
      ? `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=en-US`
      : `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=en-US`;

  const res = await fetch(endpoint, { next: { revalidate: 86400 } }); // cache 24h
  if (!res.ok) throw new Error(`TMDB ${res.status} for id ${tmdbId}`);
  const data = await res.json();

  // Movies → original_title, TV → original_name
  const title: string =
    data.original_title ?? data.original_name ?? data.title ?? data.name ?? "";
  const dateStr: string = data.release_date ?? data.first_air_date ?? "";
  const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;

  return { title, year };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const tmdbIdRaw = searchParams.get("tmdbId");
  const typeRaw = searchParams.get("type");
  const seasonRaw = searchParams.get("season");
  const episodeRaw = searchParams.get("episode");

  // ── Validate ─────────────────────────────────────────────────────────────
  if (!tmdbIdRaw || isNaN(Number(tmdbIdRaw))) {
    return NextResponse.json({ error: "tmdbId is required" }, { status: 400 });
  }
  if (typeRaw !== "movie" && typeRaw !== "tv") {
    return NextResponse.json(
      { error: "type must be 'movie' or 'tv'" },
      { status: 400 }
    );
  }

  const tmdbId = parseInt(tmdbIdRaw, 10);
  const type = typeRaw as "movie" | "tv";
  const season = seasonRaw ? parseInt(seasonRaw, 10) : 1;
  const episode = episodeRaw ? parseInt(episodeRaw, 10) : 1;

  // ── Fetch English title from TMDB ─────────────────────────────────────────
  let title: string;
  let year: number | null;
  try {
    ({ title, year } = await fetchOriginalTitle(tmdbId, type));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TMDB lookup failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!title) {
    return NextResponse.json({ error: "Could not resolve title from TMDB" }, { status: 502 });
  }

  // ── Resolve stream via Consumet/FlixHQ ────────────────────────────────────
  try {
    const stream = await resolveStream({ title, type, releaseYear: year, season, episode });

    return NextResponse.json(stream, {
      headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/stream] Consumet error:", message, { title, tmdbId });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
