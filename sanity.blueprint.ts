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
