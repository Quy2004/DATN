import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";

export default defineConfig({
  server: {
    port: 8000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "server.js",
      exportName: "viteNodeApp",
      initAppOnBoot: false,
      tsCompiler: "esbuild",
      swcOptions: {},
      crypto: true,
    }),
  ],
  optimizeDeps: { exclude: ["etag", "crypto"] },
});
