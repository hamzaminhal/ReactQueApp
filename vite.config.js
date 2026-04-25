import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Any request starting with /api/foursquare gets proxied
      "/api/foursquare": {
        target: "https://places-api.foursquare.com",
        changeOrigin: true,
        // Remove the /api/foursquare prefix before sending to Foursquare
        rewrite: (path) => path.replace(/^\/api\/foursquare/, ""),
      },
    },
  },

  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
