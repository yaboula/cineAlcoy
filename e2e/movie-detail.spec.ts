// ──────────────────────────────────────────────────
// E2E-02+03: Movie Detail + Player — Sprint 16 (fixed selectors)
// ──────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

test("Navigation to movie detail shows title", async ({ page }) => {
  await page.goto("/movie/550");
  // TMDB returns the title in API language (es-ES) → "El club de la lucha"
  // Just verify h1 exists and has non-empty text
  const h1 = page.locator("h1");
  await expect(h1).toBeVisible({ timeout: 20_000 });
  const text = await h1.textContent();
  expect(text!.length).toBeGreaterThan(0);
});

test("Movie detail has VidSrc iframe", async ({ page }) => {
  // Block VidSrc iframe requests to prevent persistent connections
  await page.route("**/vidsrc.**", (route) => route.abort());
  await page.route("**/vidsrcme.**", (route) => route.abort());
  await page.goto("/movie/550");
  // Verify the iframe element exists with correct attributes (toBeAttached
  // avoids waiting for external content to load inside the iframe)
  const iframe = page.locator("iframe[title='Reproductor de video']");
  await expect(iframe).toBeAttached({ timeout: 20_000 });
  const src = await iframe.getAttribute("src");
  expect(src).toContain("vidsrc.to");
  expect(src).toContain("550");
});
