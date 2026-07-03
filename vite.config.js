import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      "lula-mammillate-slobberingly.ngrok-free.dev", // your system IP
      "localhost"
    ]
  }
});