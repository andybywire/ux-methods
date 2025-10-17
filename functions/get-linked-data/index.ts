import {createClient} from "@sanity/client";
import {documentEventHandler} from "@sanity/functions";

const metascraper = (await import("metascraper")).default;
const author = (await import("metascraper-author")).default;
const date = (await import("metascraper-date")).default;
const description = (await import("metascraper-description")).default;
const image = (await import("metascraper-image")).default;
const publisher = (await import("metascraper-publisher")).default;
const title = (await import("metascraper-title")).default;

// TO DO: need to clear error message on a successful upload

// NN/g
// npx sanity functions test get-linked-data --document-id drafts.f06c071c-8e46-42ae-8158-69d9bc71036c --dataset production --with-user-token

// Substack
// npx sanity functions test get-linked-data --document-id drafts.2f8697e9-a071-41a6-adf9-f1f188640c84 --dataset production --with-user-token

// example.com
// npx sanity functions test get-linked-data --document-id drafts.26c17169-fa22-4345-b0b1-6e89ad16224a --dataset production --with-user-token

export const handler = documentEventHandler(async ({context, event}) => {
  const client = createClient({
    ...context.clientOptions,
    apiVersion: "vX",
    useCdn: false,
  });
  const {data} = event;
  const {local} = context; // local is true when running locally

  type LinkedData = {
    author?: string;
    date?: string;
    description?: string;
    image?: string;
    publisher?: string;
    title?: string;
  };

  const getData = metascraper([
    author(),
    date(),
    description(),
    image(),
    publisher(),
    // title(),
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
    // noWrite: true,
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

    // Patch failure message and reset ldIsUpdating flag
    await client.agent.action.patch({
      schemaId: "_.schemas.production",
      documentId: data._id,
      target: [
        {
          path: ["resourceUrlLd", "ldIsUpdating"],
          operation: "set",
          value: false,
        },
        {
          path: ["resourceUrlLd", "ldUpdateIssue"],
          operation: "set",
          value:
            "There was an issue fetching linked data. Please check the submitted URL.",
        },
      ],
    });
    return;
  }
  const html = await res.text();

  // 3. extract metadata & set up helpers
  let urlLinkedData: LinkedData = {};
  try {
    urlLinkedData = (await getData({html, url: data.url})) as LinkedData;
  } catch (err) {
    // Patch failure message and reset ldIsUpdating flag
    await client.agent.action.patch({
      schemaId: "_.schemas.production",
      documentId: data._id,
      target: [
        {
          path: ["resourceUrlLd", "ldIsUpdating"],
          operation: "set",
          value: false,
        },
        {
          path: ["resourceUrlLd", "ldUpdateIssue"],
          operation: "set",
          value:
            "There was an issue fetching linked data. Please check the submitted URL.",
        },
      ],
    });
    return;
  }

  const has = (v: unknown) =>
    v !== null &&
    v !== undefined &&
    !(typeof v === "string" && v.trim() === "");

  if (!Object.values(urlLinkedData).some(has)) {
    // Patch "empty" message and reset ldIsUpdating flag
    console.log("Null keys detected");
    await client.agent.action.patch({
      schemaId: "_.schemas.production",
      documentId: data._id,
      target: [
        {
          path: ["resourceUrlLd", "ldIsUpdating"],
          operation: "set",
          value: false,
        },
        {
          path: ["resourceUrlLd", "ldUpdateIssue"],
          operation: "set",
          value: "No linked data was found at this URL",
        },
      ],
    });
    return;
  }

  const targets: (
    | { path: string[]; operation: "set"; value: any }
    | { path: string[]; operation: "unset" }
  )[] = [];

  const setIf = (path: string[], value: unknown) => {
    if (has(value)) targets.push({path, operation: "set", value});
  };

  // 6. Conditionally upload image, if present, to the asset store
  let imageAssetId: string | undefined;
  try {
    if (urlLinkedData.image) {
      const imgRes = await fetch(urlLinkedData.image, {
        redirect: "follow",
        headers: {accept: "image/*"},
      });

      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const imageAsset = await client.assets.upload("image", buffer);
      imageAssetId = imageAsset._id;
    }
  } catch (err) {
    console.warn("Image fetch/upload skipped:", err);
  }

  // 5) build conditional patch operations
  // setIf(["title"], urlLinkedData.title);
  setIf(["author"], urlLinkedData.author);
  setIf(["metaDescription"], urlLinkedData.description);
  setIf(["pubDate"], urlLinkedData.date);
  setIf(["publisher", "pubName"], urlLinkedData.publisher);

  // a) Only set resourceImage if we actually uploaded one
  if (has(imageAssetId)) {
    targets.push({
      path: ["resourceImage"],
      operation: "set",
      value: {
        _type: "image",
        asset: {_type: "reference", _ref: imageAssetId},
      },
    });
  }

  // b) Always update bookkeeping flags
  targets.push(
    {
      path: ["resourceUrlLd", "ldLastUpdated"],
      operation: "set",
      value: data.ldRequested,
      // value: new Date().toISOString(), // change to delta::changedAny()
    },
    {
      path: ["resourceUrlLd", "ldIsUpdating"],
      operation: "set",
      value: false,
    }
  );

  // 6) apply the schema-aware patch
  await client.agent.action.patch({
    noWrite: local ? true : false,
    schemaId: "_.schemas.production",
    documentId: data._id,
    target: targets,
  });

  console.log(
    local
      ? "Linked Data (LOCAL TEST MODE - Content Lake not updated):"
      : "Linked Data:",
    urlLinkedData
  );
});
