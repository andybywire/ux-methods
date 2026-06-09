import path from 'path'
import {defineCliConfig} from 'sanity/cli'
import {watchAndRun} from 'vite-plugin-watch-and-run'

export default defineCliConfig({
  api: {
    projectId: '4g5tw1k0',
    dataset: 'production'
  },
  studioHost: 'uxmethods',
  deployment: {
    autoUpdates: true,
    appId: 'vgf4e6erwye9hl1wxg4ju9be'
  },
  typegen: {
    "path": "../astro/src/**/*.{ts,tsx,js,jsx,astro}",
    "schema": "schema.json",
    "generates": "../astro/src/sanity/sanity.types.ts",
    "overloadClientMethods": true
  },
  vite: {
    resolve: {
      // In-monorepo dev: serve the content-model plugin from its TypeScript
      // SOURCE instead of its built dist/, so edits show up live (with HMR) and
      // no rebuild is needed. Vite doesn't honor the package's `source` export
      // condition, and adding it globally would also pull @sanity/ui from its
      // source — so we alias just this one package. Remove when the plugin is
      // extracted and consumed as a published package. See the plugin's
      // docs/decisions/0007 and README.
      alias: [
        {
          find: /^sanity-plugin-mermaid-content-model$/,
          replacement: path.resolve('../sanity-plugin-mermaid-content-model/src/index.tsx'),
        },
      ],
    },
    plugins: [
      watchAndRun([
        {
          name: 'schema-extract',
          watch: path.resolve('schemaTypes/**/*.(ts|tsx)'),
          run: 'pnpm run schema:extract',
        },
      ]),
    ],
  }
})
