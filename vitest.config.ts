/**
 * @license MIT
 * @copyright Copyright 2026 Modus Operandi Inc. All Rights Reserved.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Include compiled artifacts to make sure all .ts files part of build are included
      include: ['spec-*.js', 'chunk-*.js', 'src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['**/testing/**/*', '**/test/**/*', '**/*.html'],

      thresholds: {
        perFile: true,
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      watermarks: {
        lines: [80, 100],
        functions: [80, 100],
        branches: [80, 100],
        statements: [80, 100],
      },
    },
    reporters: [
      'default',
      [
        'junit',
        {
          outputFile: './test-reports/test-results.xml',
        },
      ],
    ],
  },
});
