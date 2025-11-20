import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // <===== ISSO CORRIGE O ERRO
  build: {
    outDir: 'dist',
  },
});
