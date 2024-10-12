import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    outDir: "dist",
  },
  test: {
    includeSource: ["**/*.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src"],
      reporter: ["html", "json-summary", "json"],
      thresholds: {
        lines: 65,
        branches: 80,
        functions: 65,
        statements: 65,
      },
    },
    environment: "node",
  },
})
