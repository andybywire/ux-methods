import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      type: 'sanity.function.document',
      name: 'auto-tag',
      src: './functions/auto-tag',
      memory: 2,
      timeout: 30,
      event: {
        on: ['publish'],
        filter: "_type == 'method' && !defined(topic)",
        projection: '{_id}',
      },
    }),
  ],
})


// npx sanity functions test auto-tag --document-id a36eed7b-e3c2-4caa-8b0e-9ba7cc2cdcc8 --dataset production --with-user-token