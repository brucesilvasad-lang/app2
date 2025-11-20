import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',        // 👈 OBRIGATÓRIO PARA GITHUB PAGES
  root: '.',         // ok
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
  }
});
