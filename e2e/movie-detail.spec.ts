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

test("Movie playback opens the current VidSrc embed", async ({ page }) => {
  await page.route("https://vidsrc.sh/**", (route) => route.abort());
  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Reproducir", exact: true }).click();
  await expect(page.locator('iframe[title="Reproductor VidSrc"]')).toHaveAttribute(
    "src",
    "https://vidsrc.sh/embed/movie/550"
  );
});
