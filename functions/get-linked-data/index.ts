import {createClient} from "@sanity/client";
import {documentEventHandler} from "@sanity/functions";

// npx sanity functions test get-linked-data --document-id drafts.2f8697e9-a071-41a6-adf9-f1f188640c84 --dataset production --with-user-token

export const handler = documentEventHandler(async ({context, event}) => {
  const client = createClient({
    ...context.clientOptions,
    apiVersion: "vX",
    useCdn: false,
  });
  const {data} = event;
  const {local} = context; // local is true when running locally

  console.log("Document Title is: ", data.title);
  console.log("Is local: ", local);
  
  const dataset = "production"; // your dataset

  // Set ldIsUpdating to `true` to prevent subsequent calls
  // 🚨 Disable for testing, since `noWrite` doesn't work
  // await client.agent.action.patch({
  //   schemaId: "_.schemas.production",
  //   documentId: data._id,
  //   target: {
  //     path: ["resourceUrlLd", "ldIsUpdating"],
  //     operation: "set",
  //     value: true,
  //   },
  //   noWrite: true,
  // });





  
  // try {
  //   // Query the embeddings index
  //   const result = await client.request({
  //     url: `/embeddings-index/query/${dataset}/${indexName}`,
  //     method: "POST",
  //     body: {
  //       query: `Based on the following text segment, suggest three relevant topic tags that succinctly and clearly describe the text: ${data.sourceText}.`,
  //       maxResults: 3,
  //     },
  //   });
  //   // Convert embeddings results to tags refs
  //   const tags = result.map(
  //     ({value}: {value: {documentId: string; type: string}}) => ({
  //       _ref: value.documentId,
  //       _type: "reference",
  //     })
  //   );
  //   // Patch using schema-aware agent action
  //   await client.agent.action.patch({
  //     noWrite: local ? true : false, // if local is true, don't write to the document, just return the result for logging
  //     schemaId: "_.schemas.production",
  //     documentId: data._id,
  //     target: {
  //       path: ["resources"],
  //       operation: "set",
  //       value: tags,
  //     },
  //   });
  //   console.log(
  //     local
  //       ? "Referenced tags (LOCAL TEST MODE - Content Lake not updated):"
  //       : "Referenced tags:",
  //     result
  //   );
  // } catch (error) {
  //   console.error("Error occurred during tag retrieval: ", error);
  // }
});
