import {defineConfig} from 'vitest/config'

export default defineConfig({
  // Transform .tsx with the automatic JSX runtime via esbuild, so component
  // tests need no @vitejs/plugin-react (and no Vite-version coupling).
  esbuild: {jsx: 'automatic'},
  test: {
    // jsdom for the few React component/interaction tests. The pure
    // probe/walker/emit/adapter/build-diagram suites don't use the DOM; they
    // run fine here too (the suite is tiny). Browser-only APIs the diagram
    // needs — mermaid.render, clipboard, canvas — are mocked in component tests.
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
