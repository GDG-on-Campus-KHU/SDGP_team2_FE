import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Firebase Hosting에 배포할 빌드 출력 폴더
  },
  server: {
    port: 8080,
    // proxy: {
    //   "/api": {
    //     target: "http://34.64.59.141:8080",
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: (path) => path,
    //   },
    // },
  },
});
