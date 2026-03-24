/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      provider: "v8",
      // reporter: ["text", "json", "html"],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
