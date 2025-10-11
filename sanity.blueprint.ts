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
        filter: "_type == 'newsletter'",
        projection: '{_id, "sourceText": body}',
      },
    }),
  ],
})

// npx sanity functions test find-resources --document-id drafts.230a29af-6344-48ff-80a8-89dd75a70aea --dataset production --with-user-token
// 230a29af-6344-48ff-80a8-89dd75a70aea