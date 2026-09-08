import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Jest-like globals
    globals: true,
    // Environment
    environment: 'jsdom',
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-results/junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', ['cobertura', { file: 'Cobertura.xml' }]],
      reportsDirectory: 'coverage',
    },
  },
});
