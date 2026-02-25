// ──────────────────────────────────────────────────
// E2E-01: Homepage Load — Sprint 16 (fixed selectors)
// ──────────────────────────────────────────────────

import { test, expect } from "@playwright/test";

test("Homepage loads with header and at least one section", async ({ page }) => {
  await page.goto("/");
  // Header should be visible
  await expect(page.locator("header")).toBeVisible({ timeout: 15_000 });
  // At least one h2 section title should appear
  await expect(page.locator("h2").first()).toBeVisible({ timeout: 20_000 });
});

test("Homepage hero banner is visible", async ({ page }) => {
  await page.goto("/");
  // Hero section has aria-label starting with "Hero:"
  const hero = page.locator("section[aria-label^='Hero:']");
  await expect(hero).toBeVisible({ timeout: 20_000 });
});
