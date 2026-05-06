import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],

  build: {
    // Output directly into the Odoo addon's static directory.
    // Run `npm run build` from the frontend/ directory; the file lands at
    // nakivo_reseller_portal/static/react/index.html and the Docker volume
    // mount picks it up automatically.
    outDir: "../nakivo_reseller_portal/static/react",
    emptyOutDir: false,
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8069",
        changeOrigin: true,
      },
      "/web": {
        target: "http://localhost:8069",
        changeOrigin: true,
      },
    },
  },
});
