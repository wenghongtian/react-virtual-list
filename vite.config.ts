import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "react-virtual-list",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: "react",
          "react-dom": "react-dom",
        },
      },
    },
  },
  mode: "production",
});
