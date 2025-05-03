import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080, 
    proxy: {
      '/api': {
        target: 'http://35.216.4.12:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
});
