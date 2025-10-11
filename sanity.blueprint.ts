import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      type: "sanity.function.document",
      name: "find-resources",
      src: "./functions/find-resources",
      memory: 2,
      timeout: 30,
      event: {
        on: ["publish"],
        filter: "_type == 'post'",
        projection: '{_id, "sourceText": body}',
      },
    }),
  ],
})

// npx sanity functions test find-resources --document-id drafts.6c716074-395c-46ee-a5f6-eaaa7b20f45f --dataset production --with-user-token