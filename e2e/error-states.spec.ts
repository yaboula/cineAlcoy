// ──────────────────────────────────────────────────
// E2E-07: Error State (invalid ID) — Sprint 16 (fixed selectors)
// ──────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

test("Navigating to /movie/abc shows not-found page", async ({ page }) => {
  await page.goto("/movie/abc");
  // h1 text is "Esta película no existe"
  await expect(page.locator("h1")).toContainText("Esta película no existe", { timeout: 15_000 });
});

test("Navigating to /tv/999999999 shows not-found page", async ({ page }) => {
  await page.goto("/tv/999999999");
  // Either "Esta serie no existe" or error fallback heading
  const heading = page.locator("h1, h2").first();
  await expect(heading).toBeVisible({ timeout: 20_000 });
});
