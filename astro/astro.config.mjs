import {defineConfig} from 'astro/config'
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import tsconfigPaths from 'vite-tsconfig-paths'
import {watchAndRun} from 'vite-plugin-watch-and-run'

export default defineConfig({
  integrations: [
    sanity({
      projectId: '4g5tw1k0',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2025-11-01',
      // studioBasePath: "/studio", // If you want to access the Studio on a route
      // stega: {
      //   studioUrl: "/studio",
      // },
    }),
    react(),
  ],
  // output: 'server', // this should be the only line I need to change for the `preview` subdomain
  vite: {
    plugins: [
      tsconfigPaths(),
      watchAndRun([
        {
          watch: ['src/sanity/sanity.queries.ts'],
          run: 'pnpm run gen:types',
        },
      ]),
    ],
  },
})
