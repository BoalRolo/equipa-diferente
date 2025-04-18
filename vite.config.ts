import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path-browserify";

export default defineConfig({
  base: "/json-step-builder/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
