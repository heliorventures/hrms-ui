import path from 'path';
import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    // Preserve Vitest 1's pool choice; keep file isolation enabled.
    pool: 'threads',
    exclude: [...configDefaults.exclude, '.superpowers/**', 'tools/demo-recorder/test/**'],
    restoreMocks: true,
    // Keep the existing suite's explicit beforeEach/afterEach mock lifecycle.
    clearMocks: false,
  },
});
