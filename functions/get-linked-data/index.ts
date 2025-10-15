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

  console.log("Document Title is: ", data.title);
  console.log("Is local: ", local);

  const dataset = "production"; // your dataset

  const getData = metascraper([
    author(),
    date(),
    description(),
    image(),
    publisher(),
    title(),
  ]);

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

  // 1) fetch HTML (set a UA to improve success on some sites)
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

  // 2) extract metadata
  const urlLinkedData = await getData({html, url: data.url});

  console.log(urlLinkedData);

});
