import {createClient} from "@sanity/client";
import {documentEventHandler} from "@sanity/functions";

// Dynamic imports for CJS/ESM interop
const metascraper = (await import("metascraper")).default;
const author = (await import("metascraper-author")).default;
const date = (await import("metascraper-date")).default;
const description = (await import("metascraper-description")).default;
const image = (await import("metascraper-image")).default;
const publisher = (await import("metascraper-publisher")).default;
const title = (await import("metascraper-title")).default;

// Types
type LinkedData = {
  author?: string;
  date?: string;
  description?: string;
  image?: string;
  publisher?: string;
  title?: string;
};

type PatchTarget =
  | {path: string[]; operation: "set"; value: any}
  | {path: string[]; operation: "unset"};

// Patch helper
const patchAgent = (
  client: ReturnType<typeof createClient>,
  noWrite: boolean = false
) => {
  return async (documentId: string, target: PatchTarget | PatchTarget[]) => {
    await client.agent.action.patch({
      schemaId: "_.schemas.production",
      documentId,
      target,
      noWrite,
    });
  };
};

// Handler
export const handler = documentEventHandler(async ({context, event}) => {
  const client = createClient({
    ...context.clientOptions,
    apiVersion: "vX",
    useCdn: false,
  });

  const {data} = event;
  const {local} = context; // local is true when running locally
  const patch = patchAgent(client, local);

  // Targets are cleared out for each invocation
  const targets: PatchTarget[] = [];

  const has = (v: unknown) =>
    v !== null &&
    v !== undefined &&
    !(typeof v === "string" && v.trim() === "");

  const setIf = (path: string[], value: unknown) => {
    if (has(value)) targets.push({path, operation: "set", value});
  };

  const getData = metascraper([
    author(),
    date(),
    description(),
    image(),
    publisher(),
    title(),
  ]);

  // Log failures to console
  const log = (...args: unknown[]) => console.log("[get-linked-data]", ...args);

  // Log failures to dataset & reset updating flag
  const fail = async (message: string) => {
    log("fail:", message);
    await patch(data._id, [
      {
        path: ["ldMetadata", "ldIsUpdating"],
        operation: "set",
        value: false,
      },
      {
        path: ["ldMetadata", "ldUpdateIssue"],
        operation: "set",
        value: message,
      },
    ]);
  };

  try {
    if (!has(data?.url)) {
      await fail("No URL found on document.");
      return;
    }
    // 1. Set ldIsUpdating to `true` to prevent repeat calls
    await patch(data._id, {
      path: ["ldMetadata", "ldIsUpdating"],
      operation: "set",
      value: true,
    });

    // 2. Fetch HTML (set a UA to improve success on some sites)
    let html: string;
    try {
      const res = await fetch(data.url, {
        redirect: "follow",
        headers: {
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) {
        await fail(`Failed to fetch URL (${res.status} ${res.statusText}).`);
        return;
      }
      html = await res.text();
    } catch (e) {
      await fail("This site couldn't be reached. Please check the URL.");
      return;
    }

    // 3. Extract metadata
    let ld: LinkedData = {};
    try {
      ld = (await getData({html, url: data.url})) as LinkedData;
    } catch (e) {
      await fail(
        "There was an issue extracting linked data from the page. Please check the URL."
      );
      return;
    }

    if (!Object.values(ld).some(has)) {
      await fail("No linked data was found at this URL.");
      return;
    }

    // 4. Upload image, if present, to the asset store
    let imageAssetId: string | undefined;
    try {
      if (ld.image) {
        const imgRes = await fetch(ld.image, {
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

    // 5) Build conditional patch
    setIf(["title"], ld.title);
    setIf(["author"], ld.author);
    setIf(["metaDescription"], ld.description);
    setIf(["pubDate"], ld.date ? ld.date.split("T")[0] : undefined);
    setIf(["publisher", "pubName"], ld.publisher);

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

    // b) Unset any previously logged issues
    targets.push({
      path: ["ldMetadata", "ldUpdateIssue"],
      operation: "unset",
    });

    // c) Always update bookkeeping flags
    targets.push(
      {
        path: ["ldMetadata", "ldLastUpdated"],
        operation: "set",
        value: new Date().toISOString(),
      },
      {
        path: ["ldMetadata", "ldIsUpdating"],
        operation: "set",
        value: false,
      }
    );

    // 6) apply the schema-aware patch
    await patch(data._id, targets);
    console.log(
      local
        ? "Linked Data (LOCAL TEST MODE - Content Lake not updated):"
        : "Linked Data:",
      ld
    );
  } catch (err) {
    // Final safety net: make sure to clear the updating flag
    try {
      await patch(data._id, {
        path: ["ldMetadata", "ldIsUpdating"],
        operation: "set",
        value: false,
      });
    } finally {
      console.error("[get-linked-data] fatal error:", err);
    }
  }
});
