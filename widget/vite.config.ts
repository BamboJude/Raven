import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Build as a single file library
    lib: {
      entry: "src/index.ts",
      name: "RavenWidget",
      fileName: () => "raven-widget.js",
      formats: ["iife"], // Immediately Invoked Function Expression - works on any website
    },
    // Output to dist folder
    outDir: "dist",
    // Don't split into chunks
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  // Development server
  server: {
    port: 5173,
    cors: true,
  },
});
