import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/inventory-visualizer/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      ui: path.resolve(import.meta.dirname, '../../ui'),
    },
  },
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
  },
});
