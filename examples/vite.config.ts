import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
// @ts-expect-error ignore
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), react(), crossOriginIsolation()],
});
