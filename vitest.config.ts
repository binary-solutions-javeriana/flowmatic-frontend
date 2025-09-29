import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    jsx: 'automatic',         
    jsxImportSource: 'react',
  },
});
