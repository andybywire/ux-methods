import {defineConfig, fontProviders} from 'astro/config'
import node from '@astrojs/node';
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import tsconfigPaths from 'vite-tsconfig-paths'
import {watchAndRun} from 'vite-plugin-watch-and-run'

export default defineConfig({
  output: 'server', 
  adapter: node({ mode: 'standalone'}),
  server: {
    port:8080,
    host: '127.0.0.1',
  },
  integrations: [
    sanity({
      projectId: '4g5tw1k0',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2025-11-01',
      stega: {
        // studioUrl: "https://uxmethods.sanity.studio/",
        studioUrl: "http://localhost:3333/production",

      },
    }),
    react(),
  ],
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
