/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base, damit das Bundle auch unter file:// / Unterpfaden via Hash-Router laeuft.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // API-Anfragen im Dev-Modus an das Express-Backend (Port 3001) weiterleiten.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
    // Zusaetzlicher Riegel: Zugriff auf die Benutzerdatei ueber den Dev-Server sperren.
    fs: {
      deny: ['**/user.yaml', '**/server/data/**'],
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: false,
  },
});
