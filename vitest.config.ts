import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/**",
        ".next/**",
        "src/components/ui/**",
        "src/hooks/**",
        "src/integrations/supabase/types.ts",
        "**/*.d.ts",
      ],
    },
  },
});
