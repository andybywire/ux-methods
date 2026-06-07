import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    // Co-located unit tests next to the source they exercise. The pure
    // probe/walker/emit modules need no DOM environment; a jsdom setup is
    // deferred until (and unless) component tests warrant it.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
