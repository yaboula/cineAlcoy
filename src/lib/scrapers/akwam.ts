import "server-only";
import * as cheerio from "cheerio";

// ──────────────────────────────────────────────────
// Cinema App — Akwam Scraper (server-only)
//
// Pipeline:
//   1. searchAkwam(title)          → find movie page URL on akwam.co
//   2. extractMp4FromAkwamPage(url)→ scrape the page for a direct .mp4 link
//   3. scrapeAkwam(title, fallback) → public API that chains 1 + 2
//
// ⚠️  CSS selectors are tied to Akwam's current WordPress theme.
//     If the site redesigns, update the arrays below.
// ──────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────

export interface AkwamSearchHit {
  title: string;
  url: string;
}

export interface AkwamScrapeResult {
  /** Direct .mp4 stream URL, or null if extraction failed. */
  mp4Url: string | null;
  /** The Akwam detail-page URL where the movie was found. */
  akwamPageUrl: string | null;
  /** Human-readable error message, or null on success. */
  error: string | null;
}

// ── Constants ─────────────────────────────────────

const AKWAM_BASE = "https://akwam.co";

/**
 * Browser-like request headers to reduce bot-detection rejections.
 * If you encounter Cloudflare 403 blocks, rotate the User-Agent string
 * or front requests through a residential proxy.
 */
const BROWSER_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ar,en-US;q=0.5",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

// ── Internal helpers ──────────────────────────────

/**
 * Fetch a URL and return its HTML. Returns null on any network or HTTP error
 * so callers can fall through gracefully instead of throwing.
 */
async function safeFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

/**
 * Ensure a href is absolute. If it is already absolute, return as-is;
 * otherwise prepend AKWAM_BASE.
 */
function toAbsolute(href: string): string {
  return href.startsWith("http") ? href : `${AKWAM_BASE}${href}`;
}

// ── Step 1 — Search ───────────────────────────────

/**
 * Search Akwam for `title` and return the URL + display title
 * of the first result.
 *
 * Selector priority is ordered from most-specific to generic fallback
 * so that theme changes degrade gracefully rather than break completely.
 */
export async function searchAkwam(title: string): Promise<AkwamSearchHit | null> {
  const searchUrl = `${AKWAM_BASE}/?s=${encodeURIComponent(title)}`;
  const html = await safeFetch(searchUrl);
  if (!html) return null;

  const $ = cheerio.load(html);

  // CSS selectors for search-result card titles — update if Akwam's theme changes.
  const candidateSelectors = [
    "article.entry-box .entry-title a",
    ".col-inner h3.entry-title a",
    ".entry-box h2 a",
    ".entry-box h3 a",
    "h2.entry-title a",
    ".post-item .post-title a",
    // Generic fallbacks: any article link that looks like a movie/series URL
    "article a[href*='/movie/']",
    "article a[href*='/film/']",
    "article a[href*='/series/']",
  ];

  for (const sel of candidateSelectors) {
    const el = $(sel).first();
    const href = el.attr("href");
    if (href) {
      return { title: el.text().trim() || title, url: toAbsolute(href) };
    }
  }

  return null;
}

// ── Step 2 — Extract .mp4 ─────────────────────────

/**
 * Scrape a direct .mp4 stream URL from an Akwam movie detail page.
 *
 * Four strategies are attempted in order:
 *   1. `<a href="*.mp4">` or `<source src="*.mp4">` elements
 *   2. `<video src="*.mp4">` elements
 *   3. Inline `<script>` text that embeds a file URL
 *   4. Download/redirect link → follow chain → inspect final URL
 */
export async function extractMp4FromAkwamPage(
  moviePageUrl: string
): Promise<string | null> {
  const html = await safeFetch(moviePageUrl);
  if (!html) return null;

  const $ = cheerio.load(html);

  // ── Strategy 1: <a href="*.mp4"> or <source src="*.mp4"> ──────────────
  let found: string | null = null;

  $("a[href], source[src]").each((_, el) => {
    if (found) return;
    const attr = $(el).attr("href") ?? $(el).attr("src") ?? "";
    if (/\.mp4(\?|$)/i.test(attr)) {
      found = attr.startsWith("http") ? attr : toAbsolute(attr);
    }
  });
  if (found) return found;

  // ── Strategy 2: <video src> ───────────────────────────────────────────
  const videoSrc = $("video[src]").first().attr("src");
  if (videoSrc && /\.mp4/i.test(videoSrc)) return toAbsolute(videoSrc);

  // ── Strategy 3: Inline JS with file URL ───────────────────────────────
  // Handles patterns like:  file: "https://cdn.akwam.co/film.mp4"
  //                          src: "https://cdn.akwam.co/film.mp4?token=..."
  $("script").each((_, el) => {
    if (found) return;
    const code = $(el).html() ?? "";
    const match =
      code.match(/['"](https?:\/\/[^'"]+\.mp4[^'"]{0,100})['"]/i) ??
      code.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]{0,100})['"]/i);
    if (match) found = match[1];
  });
  if (found) return found;

  // ── Strategy 4: Follow download / go-link redirect ────────────────────
  const redirectHref = $(
    [
      "a.btn-download",
      "a.download-btn",
      ".download-box a",
      "a[href*='/go/']",
      "a[href*='/download/']",
      "a[href*='akwam.co/go']",
    ].join(", ")
  )
    .first()
    .attr("href");

  if (redirectHref) {
    const absoluteRedirect = toAbsolute(redirectHref);
    try {
      const redir = await fetch(absoluteRedirect, {
        headers: BROWSER_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });

      // If the redirect chain landed directly on a .mp4, we're done
      if (/\.mp4/i.test(redir.url)) return redir.url;

      // Otherwise parse the landing page for a .mp4 link
      const redirHtml = await redir.text();
      const $r = cheerio.load(redirHtml);
      let redirMp4: string | null = null;

      $r("a[href], source[src]").each((_, el) => {
        if (redirMp4) return;
        const attr = $r(el).attr("href") ?? $r(el).attr("src") ?? "";
        if (/\.mp4(\?|$)/i.test(attr)) redirMp4 = toAbsolute(attr);
      });

      if (redirMp4) return redirMp4;
    } catch {
      // Redirect chain failed — fall through to null
    }
  }

  return null;
}

// ── Public API ────────────────────────────────────

/**
 * Full pipeline: search Akwam → scrape detail page → return mp4 URL.
 *
 * @param primaryTitle  - Usually the movie's Arabic `original_title` from TMDB.
 * @param fallbackTitle - Optional Latin-script title used if the primary search fails.
 */
export async function scrapeAkwam(
  primaryTitle: string,
  fallbackTitle?: string
): Promise<AkwamScrapeResult> {
  // Try the primary (typically Arabic) title first
  let hit = await searchAkwam(primaryTitle);

  // Fall back to the Latin title if needed
  if (!hit && fallbackTitle && fallbackTitle !== primaryTitle) {
    hit = await searchAkwam(fallbackTitle);
  }

  if (!hit) {
    return {
      mp4Url: null,
      akwamPageUrl: null,
      error: `No se encontró "${primaryTitle}" en Akwam`,
    };
  }

  const mp4Url = await extractMp4FromAkwamPage(hit.url);

  return {
    mp4Url,
    akwamPageUrl: hit.url,
    error: mp4Url
      ? null
      : "Película encontrada en Akwam pero no se pudo extraer el enlace de streaming",
  };
}
