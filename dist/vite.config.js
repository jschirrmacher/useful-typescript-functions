"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
// https://vitejs.dev/config/
exports.default = (0, config_1.defineConfig)({
    plugins: [],
    build: {
        outDir: "dist",
    },
    test: {
        includeSource: ["**/*.ts"],
        setupFiles: ["./test-setup.ts"],
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
});
//# sourceMappingURL=vite.config.js.map