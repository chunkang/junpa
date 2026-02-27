import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/types/**",
        "src/app/layout.tsx",
        "src/app/globals.css",
        "src/app/page.tsx",
        "src/app/not-found.tsx",
        "src/app/error.tsx",
        "src/app/watch/*/page.tsx",
        "src/lib/api/endpoints.ts",
        "src/lib/api/types.ts",
        "src/components/providers.tsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
