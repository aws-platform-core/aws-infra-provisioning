import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "aip.odido.nl",
    port: 5173,
    https: {
      key: "./cert/selfsigned.key",
      cert: "./cert/selfsigned.crt",
    }
  },
});
