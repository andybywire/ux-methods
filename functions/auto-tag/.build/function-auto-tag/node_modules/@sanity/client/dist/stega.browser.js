import { requester as requester$1, createClient as createClient$1, SanityClient, ObservableSanityClient } from "@sanity/client";
export * from "@sanity/client";
import { encodeIntoResult, stegaEncodeSourceMap } from "./_chunks-es/stegaEncodeSourceMap.js";
import { stegaClean, vercelStegaCleanAll } from "./_chunks-es/stegaClean.js";
class SanityStegaClient extends SanityClient {
}
class ObservableSanityStegaClient extends ObservableSanityClient {
}
const requester = requester$1, createClient = createClient$1;
export {
  ObservableSanityStegaClient,
  SanityStegaClient,
  createClient,
  encodeIntoResult,
  requester,
  stegaClean,
  stegaEncodeSourceMap,
  vercelStegaCleanAll
};
//# sourceMappingURL=stega.browser.js.map
