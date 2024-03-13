import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/example/**'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [
        '**/example/**',
        '**/test/**',
        'src/index.ts',
        'src/websocket.ts',
      ],
    },
    environment: 'jsdom',
  },
})
