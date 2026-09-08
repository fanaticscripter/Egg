import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/loot-analysis/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
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
