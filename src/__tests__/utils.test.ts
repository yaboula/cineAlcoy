// ──────────────────────────────────────────────────
// Sprint 15 — Unit tests: getTMDBImageUrl
// ──────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { getTMDBImageUrl } from "@/types";

describe("getTMDBImageUrl", () => {
  it("returns full URL for a valid path", () => {
    expect(getTMDBImageUrl("/abc.jpg")).toBe(
      "https://image.tmdb.org/t/p/w500/abc.jpg"
    );
  });

  it("uses the specified size", () => {
    expect(getTMDBImageUrl("/abc.jpg", "w780")).toContain("/w780/");
    expect(getTMDBImageUrl("/abc.jpg", "original")).toContain("/original/");
  });

  it("returns null for null path", () => {
    expect(getTMDBImageUrl(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getTMDBImageUrl("")).toBeNull();
  });
});
