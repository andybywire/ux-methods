import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',

  dts: 'rolldown',

  // Quiet api-extractor's release-tag lint. The plugin's public surface is
  // small and we don't annotate every export with @public/@internal; revisit
  // if/when the API stabilises for the standalone-repo extraction.
  extract: {
    rules: {
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
})
