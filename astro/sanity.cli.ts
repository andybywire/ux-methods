import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  typegen: {
    path: './src/**/*.{ts,tsx,js,jsx,astro}',
    schema: '../studio/schema.json',
    generates: './sanity.types.ts',
    overloadClientMethods: true,
  },
})
