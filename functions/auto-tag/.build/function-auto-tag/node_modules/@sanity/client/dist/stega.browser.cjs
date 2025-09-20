"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var client = require("@sanity/client"), stegaEncodeSourceMap = require("./_chunks-cjs/stegaEncodeSourceMap.cjs"), stegaClean = require("./_chunks-cjs/stegaClean.cjs");
class SanityStegaClient extends client.SanityClient {
}
class ObservableSanityStegaClient extends client.ObservableSanityClient {
}
const requester = client.requester, createClient = client.createClient;
exports.encodeIntoResult = stegaEncodeSourceMap.encodeIntoResult;
exports.stegaEncodeSourceMap = stegaEncodeSourceMap.stegaEncodeSourceMap;
exports.stegaClean = stegaClean.stegaClean;
exports.vercelStegaCleanAll = stegaClean.vercelStegaCleanAll;
exports.ObservableSanityStegaClient = ObservableSanityStegaClient;
exports.SanityStegaClient = SanityStegaClient;
exports.createClient = createClient;
exports.requester = requester;
Object.keys(client).forEach(function(k) {
  k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k) && Object.defineProperty(exports, k, {
    enumerable: !0,
    get: function() {
      return client[k];
    }
  });
});
//# sourceMappingURL=stega.browser.cjs.map
