import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sw: resolve(__dirname, 'src/sw.ts')
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === 'sw' ? '[name].js' : 'assets/[name]-[hash].js';
        }
      }
    }
  }
});
