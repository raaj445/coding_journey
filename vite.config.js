import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This enables Vite to understand JSX used by our React components.
export default defineConfig({
  plugins: [react()],
});