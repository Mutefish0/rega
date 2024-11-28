import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
// @ts-expect-error ignore
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm(), react(), crossOriginIsolation()],

  assetsInclude: [],

  base: "./",

  build: {
    target: "esnext",
    modulePreload: false,
    rollupOptions: {
      input:
        process.env.VITE_BUILD_TARGET === "deno"
          ? "./src/deno.tsx"
          : "./index.html",

      external: [
        "jsr:@mutefish/gamepad-api",
        "jsr:@gfx/canvas@0.5.6",
        "https://jsr.io/@mutefish/web-audio-api/0.1.4/mod.ts",
        "node:module",
        "node:fs",
        "node:path",
      ],
      output: {
        entryFileNames: "index.js",
      },
    },

    assetsDir: "",

    assetsInlineLimit: (path) => {
      if (path.endsWith(".wasm")) {
        return true;
      }
      return false;
    },
  },
});
