// ──────────────────────────────────────────────────
// Sprint 15 — Unit tests: validation.ts
// ──────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  validateTMDBId,
  validateSeasonNumber,
  validateEpisodeNumber,
} from "@/lib/validation";

describe("validateTMDBId", () => {
  it("accepts a positive integer string", () => {
    expect(validateTMDBId("550")).toBe(550);
    expect(validateTMDBId("1")).toBe(1);
  });

  it("throws for zero", () => {
    expect(() => validateTMDBId("0")).toThrow();
  });

  it("throws for negative number", () => {
    expect(() => validateTMDBId("-5")).toThrow();
  });

  it("throws for float", () => {
    expect(() => validateTMDBId("1.5")).toThrow();
  });

  it("throws for non-numeric string", () => {
    expect(() => validateTMDBId("abc")).toThrow();
    expect(() => validateTMDBId("movie")).toThrow();
  });

  it("throws for empty string", () => {
    expect(() => validateTMDBId("")).toThrow();
  });
});

describe("validateSeasonNumber", () => {
  it("accepts 0 (Specials)", () => {
    expect(validateSeasonNumber("0")).toBe(0);
  });

  it("accepts positive integers", () => {
    expect(validateSeasonNumber("1")).toBe(1);
    expect(validateSeasonNumber("5")).toBe(5);
  });

  it("throws for negative", () => {
    expect(() => validateSeasonNumber("-1")).toThrow();
  });
});

describe("validateEpisodeNumber", () => {
  it("accepts positive integers", () => {
    expect(validateEpisodeNumber("1")).toBe(1);
    expect(validateEpisodeNumber("12")).toBe(12);
  });

  it("throws for 0", () => {
    expect(() => validateEpisodeNumber("0")).toThrow();
  });

  it("throws for negative", () => {
    expect(() => validateEpisodeNumber("-1")).toThrow();
  });
});
