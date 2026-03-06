// ──────────────────────────────────────────────────
// Unit tests — src/lib/scrapers/akwam.ts
//
// Strategy coverage:
//   searchAkwam         — network error, 4xx, no selector match, selector hit, relative URL
//   extractMp4FromAkwamPage — strategy 1a (<a href>), 1b (<source src>),
//                             2 (<video src>), 3 (inline script),
//                             4a (redirect URL ends in .mp4),
//                             4b (redirect page has .mp4 link),
//                             all strategies fail → null
//   scrapeAkwam         — success, primary fail → fallback, both fail, mp4 not found
// ──────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// server-only is a no-op in the test environment
vi.mock("server-only", () => ({}));

import {
  searchAkwam,
  extractMp4FromAkwamPage,
  scrapeAkwam,
} from "@/lib/scrapers/akwam";

// ── Fetch mock helpers ────────────────────────────

function makeFetchResponse(
  html: string,
  ok = true,
  finalUrl = "https://akwam.co/movie/test"
): Response {
  return {
    ok,
    url: finalUrl,
    text: () => Promise.resolve(html),
  } as unknown as Response;
}

function stubFetch(...responses: Response[]) {
  const mock = vi.fn();
  responses.forEach((r, i) => {
    if (i === responses.length - 1) mock.mockResolvedValue(r);
    else mock.mockResolvedValueOnce(r);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════
// searchAkwam
// ═══════════════════════════════════════════════════

describe("searchAkwam", () => {
  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await searchAkwam("فيلم")).toBeNull();
  });

  it("returns null when fetch returns a non-ok response", async () => {
    stubFetch(makeFetchResponse("", false));
    expect(await searchAkwam("فيلم")).toBeNull();
  });

  it("returns null when no selector matches", async () => {
    stubFetch(makeFetchResponse("<html><body><p>No results</p></body></html>"));
    expect(await searchAkwam("nonexistent")).toBeNull();
  });

  it("returns hit using primary selector (article.entry-box .entry-title a)", async () => {
    const html = `
      <html><body>
        <article class="entry-box">
          <h2 class="entry-title"><a href="https://akwam.co/movie/test-film">فيلم الاختبار</a></h2>
        </article>
      </body></html>`;
    stubFetch(makeFetchResponse(html));
    const hit = await searchAkwam("فيلم");
    expect(hit).not.toBeNull();
    expect(hit!.url).toBe("https://akwam.co/movie/test-film");
    expect(hit!.title).toBe("فيلم الاختبار");
  });

  it("falls back to generic article[href*='/movie/'] selector", async () => {
    const html = `
      <html><body>
        <article>
          <a href="https://akwam.co/movie/another-film">Another</a>
        </article>
      </body></html>`;
    stubFetch(makeFetchResponse(html));
    const hit = await searchAkwam("Another");
    expect(hit).not.toBeNull();
    expect(hit!.url).toBe("https://akwam.co/movie/another-film");
  });

  it("converts relative hrefs to absolute using AKWAM_BASE", async () => {
    const html = `
      <html><body>
        <article class="entry-box">
          <h2 class="entry-title"><a href="/movie/relative-path">Film</a></h2>
        </article>
      </body></html>`;
    stubFetch(makeFetchResponse(html));
    const hit = await searchAkwam("Film");
    expect(hit!.url).toBe("https://akwam.co/movie/relative-path");
  });

  it("encodes the title in the query string", async () => {
    let capturedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        capturedUrl = url;
        return Promise.resolve(makeFetchResponse(""));
      })
    );
    await searchAkwam("فيلم عربي");
    expect(capturedUrl).toContain(encodeURIComponent("فيلم عربي"));
  });
});

// ═══════════════════════════════════════════════════
// extractMp4FromAkwamPage
// ═══════════════════════════════════════════════════

describe("extractMp4FromAkwamPage", () => {
  it("returns null when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net::ERR")));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x")).toBeNull();
  });

  it("returns null when fetch returns non-ok", async () => {
    stubFetch(makeFetchResponse("", false));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x")).toBeNull();
  });

  // ── Strategy 1a: <a href="*.mp4"> ──────────────────────────────────
  it("strategy 1a: extracts mp4 from <a href>", async () => {
    const html = `<html><body>
      <a href="https://cdn.akwam.co/movie.mp4">Download</a>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/movie.mp4");
  });

  it("strategy 1a: extracts mp4 with query string", async () => {
    const html = `<html><body>
      <a href="https://cdn.akwam.co/movie.mp4?token=abc123">Download</a>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/movie.mp4?token=abc123");
  });

  // ── Strategy 1b: <source src="*.mp4"> ──────────────────────────────
  it("strategy 1b: extracts mp4 from <source src>", async () => {
    const html = `<html><body>
      <video><source src="https://cdn.akwam.co/film.mp4" type="video/mp4" /></video>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/film.mp4");
  });

  // ── Strategy 2: <video src> ─────────────────────────────────────────
  it("strategy 2: extracts mp4 from <video src>", async () => {
    const html = `<html><body>
      <video src="https://cdn.akwam.co/direct.mp4"></video>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/direct.mp4");
  });

  it("strategy 2: converts relative <video src> to absolute", async () => {
    const html = `<html><body>
      <video src="/media/film.mp4"></video>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://akwam.co/media/film.mp4");
  });

  // ── Strategy 3: Inline <script> ─────────────────────────────────────
  it("strategy 3: extracts mp4 from inline script (bare URL in quotes)", async () => {
    const html = `<html><body>
      <script>var player = {src: "https://stream.akwam.co/film.mp4"};</script>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://stream.akwam.co/film.mp4");
  });

  it("strategy 3: extracts mp4 from inline script with file: key pattern", async () => {
    const html = `<html><body>
      <script>jwplayer().setup({file: 'https://stream.akwam.co/arabic-film.mp4?token=xyz'});</script>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://stream.akwam.co/arabic-film.mp4?token=xyz");
  });

  // ── Strategy 4a: Redirect chain → URL ends in .mp4 ─────────────────
  it("strategy 4a: follows redirect link and returns .mp4 final URL", async () => {
    const moviePageHtml = `<html><body>
      <a class="btn-download" href="/go/12345">Get File</a>
    </body></html>`;
    const moviePageResponse = makeFetchResponse(moviePageHtml);
    // The redirect response lands on a .mp4 URL
    const redirResponse = makeFetchResponse("", true, "https://cdn.akwam.co/final.mp4");

    stubFetch(moviePageResponse, redirResponse);
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/final.mp4");
  });

  // ── Strategy 4b: Redirect chain → landing page has .mp4 link ───────
  it("strategy 4b: parses .mp4 link from redirect landing page", async () => {
    const moviePageHtml = `<html><body>
      <a href="/go/99">Download</a>
    </body></html>`;
    const redirPageHtml = `<html><body>
      <a href="https://cdn.akwam.co/landed.mp4">Direct link</a>
    </body></html>`;

    const redirResponse = makeFetchResponse(
      redirPageHtml,
      true,
      "https://gopage.akwam.co/"  // final URL is NOT .mp4
    );
    stubFetch(makeFetchResponse(moviePageHtml), redirResponse);
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x"))
      .toBe("https://cdn.akwam.co/landed.mp4");
  });

  it("strategy 4: returns null when redirect fetch throws", async () => {
    const moviePageHtml = `<html><body>
      <div class="download-box"><a href="/go/error">Download</a></div>
    </body></html>`;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(makeFetchResponse(moviePageHtml))
      .mockRejectedValueOnce(new Error("connection refused"));
    vi.stubGlobal("fetch", fetchMock);
    // Strategy 4 redirect throws → returns null
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x")).toBeNull();
  });

  it("returns null when no strategy matches", async () => {
    const html = `<html><body>
      <p>No video content here</p>
      <a href="https://akwam.co/page">Non-video link</a>
    </body></html>`;
    stubFetch(makeFetchResponse(html));
    expect(await extractMp4FromAkwamPage("https://akwam.co/movie/x")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════
// scrapeAkwam (full pipeline)
// ═══════════════════════════════════════════════════

describe("scrapeAkwam", () => {
  it("returns mp4Url and no error on full success", async () => {
    const searchHtml = `<html><body>
      <article class="entry-box">
        <h2 class="entry-title"><a href="https://akwam.co/movie/film">فيلم</a></h2>
      </article>
    </body></html>`;
    const detailHtml = `<html><body>
      <a href="https://cdn.akwam.co/success.mp4">Watch</a>
    </body></html>`;

    stubFetch(makeFetchResponse(searchHtml), makeFetchResponse(detailHtml));

    const result = await scrapeAkwam("فيلم");
    expect(result.mp4Url).toBe("https://cdn.akwam.co/success.mp4");
    expect(result.akwamPageUrl).toBe("https://akwam.co/movie/film");
    expect(result.error).toBeNull();
  });

  it("tries fallback title when primary search returns null", async () => {
    // First call (primary) → no results; second call (fallback) → hit found
    const emptyHtml = "<html><body></body></html>";
    const fallbackSearchHtml = `<html><body>
      <article class="entry-box">
        <h2 class="entry-title"><a href="https://akwam.co/movie/fallback">Fallback Film</a></h2>
      </article>
    </body></html>`;
    const detailHtml = `<html><body>
      <video src="https://cdn.akwam.co/fallback.mp4"></video>
    </body></html>`;

    stubFetch(
      makeFetchResponse(emptyHtml),         // primary search → no match
      makeFetchResponse(fallbackSearchHtml), // fallback search → match
      makeFetchResponse(detailHtml)          // detail page
    );

    const result = await scrapeAkwam("فيلم عربي", "Arabic Film");
    expect(result.mp4Url).toBe("https://cdn.akwam.co/fallback.mp4");
    expect(result.error).toBeNull();
  });

  it("does not retry with fallback when it equals primaryTitle", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeFetchResponse(""));
    vi.stubGlobal("fetch", fetchMock);

    const result = await scrapeAkwam("same", "same");
    // Only one search call was made
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.error).not.toBeNull();
  });

  it("returns error when both title searches fail", async () => {
    stubFetch(
      makeFetchResponse(""),
      makeFetchResponse("")
    );
    const result = await scrapeAkwam("X", "Y");
    expect(result.mp4Url).toBeNull();
    expect(result.akwamPageUrl).toBeNull();
    expect(result.error).toMatch(/X/);
  });

  it("returns no mp4Url but akwamPageUrl when search succeeds but extraction fails", async () => {
    const searchHtml = `<html><body>
      <article class="entry-box">
        <h2 class="entry-title"><a href="https://akwam.co/movie/nostream">Film</a></h2>
      </article>
    </body></html>`;
    const noStreamHtml = `<html><body><p>No video</p></body></html>`;

    stubFetch(makeFetchResponse(searchHtml), makeFetchResponse(noStreamHtml));

    const result = await scrapeAkwam("Film");
    expect(result.mp4Url).toBeNull();
    expect(result.akwamPageUrl).toBe("https://akwam.co/movie/nostream");
    expect(result.error).not.toBeNull();
  });
});
