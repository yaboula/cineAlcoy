// ──────────────────────────────────────────────────
// Vitest configuration — Sprint 15
// ──────────────────────────────────────────────────

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/lib/**", "src/hooks/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
