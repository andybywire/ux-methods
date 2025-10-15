import {createClient} from "@sanity/client";
import {documentEventHandler} from "@sanity/functions";

const metascraper = (await import("metascraper")).default;
const author = (await import("metascraper-author")).default;
const date = (await import("metascraper-date")).default;
const description = (await import("metascraper-description")).default;
const image = (await import("metascraper-image")).default;
const publisher = (await import("metascraper-publisher")).default;
const title = (await import("metascraper-title")).default;

// NN/g
// npx sanity functions test get-linked-data --document-id drafts.f06c071c-8e46-42ae-8158-69d9bc71036c --dataset production --with-user-token

// Substack
// npx sanity functions test get-linked-data --document-id drafts.2f8697e9-a071-41a6-adf9-f1f188640c84 --dataset production --with-user-token

export const handler = documentEventHandler(async ({context, event}) => {
  const client = createClient({
    ...context.clientOptions,
    apiVersion: "vX",
    useCdn: false,
  });
  const {data} = event;
  const {local} = context; // local is true when running locally

  const getData = metascraper([
    author(),
    date(),
    description(),
    image(),
    publisher(),
    title(),
  ]);

  // 1. Set ldIsUpdating to `true` to prevent repeat calls
  await client.agent.action.patch({
    schemaId: "_.schemas.production",
    documentId: data._id,
    target: {
      path: ["resourceUrlLd", "ldIsUpdating"],
      operation: "set",
      value: true,
    },
    noWrite: true,
  });

  // 2. fetch HTML (set a UA to improve success on some sites)
  const res = await fetch(data.url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) {
    console.error(`Fetch failed: ${res.status} ${res.statusText}`);
    return;
  }
  const html = await res.text();

  // 3. extract metadata
  const urlLinkedData = await getData({html, url: data.url});

  // 6. Patch image, if present
  
  
  // 5. Patch using schema-aware agent action
  //    Set ldLastUpdated & `isUpdating` to false
  await client.agent.action.patch({
    noWrite: local ? true : false, // if local is true, don't write to the document, just return the result for logging
    schemaId: "_.schemas.production",
    documentId: data._id,
    target: [
      {
        path: ["title"],
        operation: "set",
        value: urlLinkedData?.title ?? '',
      },
      {
        path: ["author"],
        operation: "set",
        value: urlLinkedData?.author ?? '',
      },
      {
        path: ["publisher", "pubName"],
        operation: "set",
        value: urlLinkedData?.publisher ?? '',
      },
      {
        path: ["resourceUrlLd", "ldLastUpdated"],
        operation: "set",
        value: data.ldRequested,
      },
      {
        path: ["resourceUrlLd", "ldIsUpdating"],
        operation: "set",
        value: false,
      },
    ],
  });
  console.log(
    local
      ? "Linked Data (LOCAL TEST MODE - Content Lake not updated):"
      : "Linked Data:",
    urlLinkedData
  );
});
