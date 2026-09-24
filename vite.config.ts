import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/ — the deploy workflow sets DEPLOY_BASE
  base: process.env.DEPLOY_BASE || "/",
  plugins: [react(), tailwindcss()],
});
