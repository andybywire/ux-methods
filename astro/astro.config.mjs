import {defineConfig, fontProviders} from 'astro/config'
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
      // to access the Studio on a route:
      // studioBasePath: "/studio", 
      // stega: {
      //   studioUrl: "/studio",
      // },
    }),
    react(),
  ],
  // this should be the only to change for the `preview` subdomain:
  // output: 'server', 
  // The fonts API trips up hot-reloading w/ Vite
  //   until it's stabilized, expect to re-run `pnpm dev` after 
  //   editing config. 
  experimental: {
    fonts: [
      {
        name: 'Nunito Sans',
        provider: fontProviders.fontsource(),
        cssVariable: '--header',
        fallbacks: ["Arial", "sans-serif"],
        weights: [100,200,300,400,500,600,700,800],
        styles: ["normal", "italic"]
      },
      {
        name: 'Hind',
        provider: fontProviders.fontsource(),
        cssVariable: '--body',
        fallbacks: ["Arial", "sans-serif"]
      },
    ],
  },
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
