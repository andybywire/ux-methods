import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // Co-located unit tests live next to the source they exercise. Larger
    // integration tests with fixtures go under tests/.
  },
})
