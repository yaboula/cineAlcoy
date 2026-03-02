// /api/stream — server-side Consumet/FlixHQ stream resolver
//
// Query params:
//   title    string   required — media title (from TMDB)
//   type     string   required — "movie" | "tv"
//   year     number   optional — release year (improves match accuracy)
//   season   number   optional — season number   (TV only, default 1)
//   episode  number   optional — episode number  (TV only, default 1)
//
// Returns { url, isM3U8, quality, subtitles } on success
//         { error: string }                   on failure

import { NextRequest, NextResponse } from "next/server";
import { resolveStream } from "@/lib/consumet/client";

export const runtime = "nodejs"; // needs Node.js fetch + AbortController

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title");
  const typeRaw = searchParams.get("type");
  const yearRaw = searchParams.get("year");
  const seasonRaw = searchParams.get("season");
  const episodeRaw = searchParams.get("episode");

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeRaw !== "movie" && typeRaw !== "tv") {
    return NextResponse.json(
      { error: "type must be 'movie' or 'tv'" },
      { status: 400 }
    );
  }

  const type = typeRaw as "movie" | "tv";
  const year = yearRaw ? parseInt(yearRaw, 10) : undefined;
  const season = seasonRaw ? parseInt(seasonRaw, 10) : 1;
  const episode = episodeRaw ? parseInt(episodeRaw, 10) : 1;

  // ── Resolve ─────────────────────────────────────────────────────────────────
  try {
    const stream = await resolveStream({
      title,
      type,
      releaseYear: year,
      season,
      episode,
    });

    return NextResponse.json(stream, {
      headers: {
        // Cache successful resolutions for 30 minutes
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/stream] Consumet error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
