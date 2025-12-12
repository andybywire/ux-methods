import {defineConfig, fontProviders} from 'astro/config'
import node from '@astrojs/node';
import sanity from '@sanity/astro'
import react from '@astrojs/react'
import tsconfigPaths from 'vite-tsconfig-paths'
import {watchAndRun} from 'vite-plugin-watch-and-run'

// --- Env-driven switches -----------------------------------
const OUTPUT = process.env.ASTRO_OUTPUT === 'static' ? 'static' : 'server'
// "preview" = drafts + stega; "production" = published-only
const SITE_MODE = process.env.ASTRO_SITE_MODE === 'production' ? 'production' : 'preview'

const isSSR = OUTPUT === 'server'
const isPreview = SITE_MODE === 'preview'
// -----------------------------------------------------------

export default defineConfig({
  output: OUTPUT, // 'server' or 'static' based on env
  adapter: isSSR ? node({ mode: 'standalone' }) : undefined,
  server: {
    port:8080,
    host: '127.0.0.1',
  },
  site: "https://uxmethods.org",
  integrations: [
    sanity({
      projectId: '4g5tw1k0',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2025-11-01',
      stega: isPreview
        ? {
            studioUrl: 'https://uxmethods.sanity.studio/production',
            // studioUrl: 'http://localhost:3333/production',
          }
        : false,
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
        weights: [
          400, // Global nav
          600, // Home page headers (dark mode)
          700, // Headers
          800  // NavHome 
        ], 
        styles: ["normal"] // no italic in headers
      },
      {
        name: 'Hind',
        provider: fontProviders.fontsource(),
        cssVariable: '--body',
        fallbacks: ["Arial", "sans-serif"],
        weights: [
          300, // text (dark mode)
          400, // tagline, text
          // 600, // bold — currently not used
        ],
      },
    ],
  },
  vite: {
    build: {
      assetsInlineLimit: 8192,
    },
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
