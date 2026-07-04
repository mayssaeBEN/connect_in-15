import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "resources/front",
  base: "/feed/",
  plugins: [react()],
  build: {
    outDir: "../../public/feed",
    emptyOutDir: true,
  }, 
}); 