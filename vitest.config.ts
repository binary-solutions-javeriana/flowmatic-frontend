import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    globals: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    reportsDirectory: './coverage',
    exclude: [
      'node_modules/',
      'src/test/',
      '**/*.config.*',
      '**/__tests__/**',
      '**/*.test.{ts,tsx}',
      '.next/',
      'dist/',
    ],
    include: ['src/**/*.{ts,tsx}'],
    all: true,
    lines: 60,
    functions: 60,
    branches: 60,
    statements: 60,
    enabled: true,
    skipFull: false,
    cleanOnRerun: false,
    clean: false,
    // Generar archivos temporales para procesamiento
    tempDirectory: './coverage/.tmp',
  },
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
