// ──────────────────────────────────────────────────
// Unit tests — src/actions/akwam-action.ts
//
// Coverage:
//   fetchAkwamStreamUrl — input validation, TMDB error,
//                         Arabic-original title routing,
//                         non-Arabic title routing,
//                         success & error propagation from scraper
// ──────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Module mocks (hoisted before imports) ─────────
vi.mock("server-only", () => ({}));

// Mock the scraper so we don't make real network calls
vi.mock("@/lib/scrapers/akwam", () => ({
  scrapeAkwam: vi.fn(),
}));

// Mock the TMDB fetcher so we don't need a real API key
vi.mock("@/lib/tmdb/fetcher", () => ({
  tmdbFetch: vi.fn(),
}));

import { fetchAkwamStreamUrl } from "@/actions/akwam-action";
import { scrapeAkwam } from "@/lib/scrapers/akwam";
import { tmdbFetch } from "@/lib/tmdb/fetcher";

const mockScrapeAkwam = vi.mocked(scrapeAkwam);
const mockTmdbFetch = vi.mocked(tmdbFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════
// Input validation
// ═══════════════════════════════════════════════════

describe("fetchAkwamStreamUrl — input validation", () => {
  it.each([
    ["zero", 0],
    ["negative", -1],
    ["float", 1.5],
    ["too large (> 10_000_000)", 10_000_001],
  ])("rejects %s tmdbId without calling TMDB or scraper", async (_, id) => {
    const result = await fetchAkwamStreamUrl(id);
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/inválido/i);
    expect(mockTmdbFetch).not.toHaveBeenCalled();
    expect(mockScrapeAkwam).not.toHaveBeenCalled();
  });

  it("accepts a valid positive integer tmdbId", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 550,
      title: "Fight Club",
      original_title: "Fight Club",
      original_language: "en",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: "https://cdn.akwam.co/fight-club.mp4",
      akwamPageUrl: "https://akwam.co/movie/fight-club",
      error: null,
    });

    const result = await fetchAkwamStreamUrl(550);
    expect(result.url).toBe("https://cdn.akwam.co/fight-club.mp4");
    expect(result.error).toBeNull();
  });

  it("accepts the maximum valid tmdbId (10_000_000)", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 10_000_000,
      title: "Edge Film",
      original_title: "Edge Film",
      original_language: "en",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: null,
      akwamPageUrl: null,
      error: "not found",
    });

    const result = await fetchAkwamStreamUrl(10_000_000);
    // Must have called TMDB — passes validation
    expect(mockTmdbFetch).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════
// TMDB error handling
// ═══════════════════════════════════════════════════

describe("fetchAkwamStreamUrl — TMDB failures", () => {
  it("returns error when tmdbFetch throws", async () => {
    mockTmdbFetch.mockRejectedValue(new Error("TMDB 503"));
    const result = await fetchAkwamStreamUrl(550);
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/TMDB/i);
    expect(mockScrapeAkwam).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════
// Title routing logic
// ═══════════════════════════════════════════════════

describe("fetchAkwamStreamUrl — title routing", () => {
  it("uses original_title as PRIMARY for Arabic-language originals", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 1234,
      title: "The Message",             // translated title
      original_title: "الرسالة",        // Arabic original
      original_language: "ar",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: "https://cdn.akwam.co/risala.mp4",
      akwamPageUrl: "https://akwam.co/movie/risala",
      error: null,
    });

    await fetchAkwamStreamUrl(1234);

    expect(mockScrapeAkwam).toHaveBeenCalledWith("الرسالة", "The Message");
  });

  it("uses translated title as PRIMARY for non-Arabic originals", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 550,
      title: "Fight Club",             // translated (es-ES in this app)
      original_title: "Fight Club",
      original_language: "en",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: null,
      akwamPageUrl: null,
      error: "not found",
    });

    await fetchAkwamStreamUrl(550);

    expect(mockScrapeAkwam).toHaveBeenCalledWith("Fight Club", "Fight Club");
  });

  it("routes an Egyptian Arabic film (ar) correctly", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 9999,
      title: "The Yacoubian Building",
      original_title: "عمارة يعقوبيان",
      original_language: "ar",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: "https://cdn.akwam.co/yacoubian.mp4",
      akwamPageUrl: "https://akwam.co/movie/yacoubian",
      error: null,
    });

    await fetchAkwamStreamUrl(9999);

    expect(mockScrapeAkwam).toHaveBeenCalledWith(
      "عمارة يعقوبيان",
      "The Yacoubian Building"
    );
  });
});

// ═══════════════════════════════════════════════════
// Scraper result propagation
// ═══════════════════════════════════════════════════

describe("fetchAkwamStreamUrl — scraper result propagation", () => {
  it("returns url: mp4 and error: null on success", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 100,
      title: "فيلم",
      original_title: "فيلم",
      original_language: "ar",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: "https://cdn.akwam.co/movie.mp4",
      akwamPageUrl: "https://akwam.co/movie/film",
      error: null,
    });

    const result = await fetchAkwamStreamUrl(100);
    expect(result).toEqual({
      url: "https://cdn.akwam.co/movie.mp4",
      error: null,
    });
  });

  it("returns url: null and propagates scraper error message on failure", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 101,
      title: "Missing Film",
      original_title: "Missing Film",
      original_language: "en",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: null,
      akwamPageUrl: "https://akwam.co/movie/missing",
      error: "Película encontrada en Akwam pero no se pudo extraer el enlace de streaming",
    });

    const result = await fetchAkwamStreamUrl(101);
    expect(result.url).toBeNull();
    expect(result.error).toMatch(/streaming/i);
  });

  it("returns url: null and error when scraper finds nothing", async () => {
    mockTmdbFetch.mockResolvedValue({
      id: 102,
      title: "Ghost",
      original_title: "Ghost",
      original_language: "en",
    });
    mockScrapeAkwam.mockResolvedValue({
      mp4Url: null,
      akwamPageUrl: null,
      error: "No se encontró \"Ghost\" en Akwam",
    });

    const result = await fetchAkwamStreamUrl(102);
    expect(result).toEqual({
      url: null,
      error: "No se encontró \"Ghost\" en Akwam",
    });
  });
});
