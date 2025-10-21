import {defineBlueprint, defineDocumentFunction} from "@sanity/blueprints";

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
    defineDocumentFunction({
      type: "sanity.function.document",
      name: "get-linked-data",
      src: "./functions/get-linked-data",
      memory: 2,
      timeout: 30,
      event: {
        on: ["update"],
        includeDrafts: true,
        includeAllVersions: true,
        filter:
          `_type == 'resource' 
          && (
            delta::changedAny(ldMetadata.ldLastRequested) 
            || (
              !defined(before().ldMetadata.ldLastRequested) 
              && defined(after().ldMetadata.ldLastRequested)
            )
          )
          && ldMetadata.ldIsUpdating != true
          `,
        projection:
          "{_id, title, 'url':resourceUrl}",
      },
    }),
  ],
});
