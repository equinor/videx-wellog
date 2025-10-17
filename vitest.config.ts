import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Jest-like globals
    globals: true,
    // Environment
    environment: 'jsdom',
  },
})