import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; font-src 'self' data:; connect-src 'self' http://localhost:5232/api https://intexbackend-a6fvcvg6cha4hwcx.centralus-01.azurewebsites.net/api; object-src 'none'; base-uri 'self'; form-action 'self'",
    },
  },
});
