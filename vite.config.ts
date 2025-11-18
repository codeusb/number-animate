import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NumberAnimate", // 仅对 UMD 有效，这里无所谓
      fileName: "number-animate",
      formats: ["es"], // 只产 ESM，最简单
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
    copyPublicDir: false,
  },
});
