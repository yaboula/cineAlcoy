// ──────────────────────────────────────────────────
// E2E-04+08+09: Search Flow — Sprint 16 (fixed selectors)
// ──────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

test("Search for 'batman' returns results", async ({ page }) => {
  await page.goto("/search?q=batman");
  // Wait for at least one media card link to appear (poster links)
  const card = page.locator("a[href^='/movie/'], a[href^='/tv/']").first();
  await expect(card).toBeVisible({ timeout: 20_000 });
});

test("Empty search shows initial state with search input", async ({ page }) => {
  await page.goto("/search");
  // The search input should be visible (there are 2 — one in header, one in page body)
  const searchInput = page.locator("input[type='search']").first();
  await expect(searchInput).toBeVisible({ timeout: 10_000 });
});

test("Search with no results shows empty state", async ({ page }) => {
  await page.goto("/search?q=xyzqweabc123notreal999");
  // Should show "Sin resultados" text
  await expect(page.getByText("Sin resultados")).toBeVisible({ timeout: 20_000 });
});
