import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  // Relative URLs so the same build works locally and on GitLab Pages,
  // whatever path the Pages site is served from.
  base: command === "build" ? "./" : "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
}));
