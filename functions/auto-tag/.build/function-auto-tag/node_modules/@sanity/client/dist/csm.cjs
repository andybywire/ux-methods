"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
var resolveEditInfo = require("./_chunks-cjs/resolveEditInfo.cjs"), config = require("./_chunks-cjs/config.cjs");
function resolvePerspectives(perspective) {
  if (config.validateApiPerspective(perspective), Array.isArray(perspective))
    return perspective.includes("published") ? perspective : [...perspective, "published"];
  switch (perspective) {
    case "previewDrafts":
    case "drafts":
      return ["drafts", "published"];
    case "published":
    default:
      return ["published"];
  }
}
function createSourceDocumentResolver(getCachedDocument, _perspective) {
  const perspectives = resolvePerspectives(_perspective);
  function findDocument(sourceDocument) {
    for (const perspective of perspectives) {
      let match = null;
      if (perspective.startsWith("r") && (match = getCachedDocument({
        ...sourceDocument,
        _id: resolveEditInfo.getVersionId(sourceDocument._id, perspective)
      })), perspective === "drafts" && (match = getCachedDocument({
        ...sourceDocument,
        _id: resolveEditInfo.getDraftId(sourceDocument._id)
      })), perspective === "published" && (match = getCachedDocument({
        ...sourceDocument,
        _id: resolveEditInfo.getPublishedId(sourceDocument._id)
      })), match)
        return { ...match, _id: resolveEditInfo.getPublishedId(match._id), _originalId: match._id };
    }
    return null;
  }
  return function(sourceDocument) {
    return findDocument(sourceDocument);
  };
}
function applySourceDocuments(result, resultSourceMap, getCachedDocument, updateFn, perspective) {
  if (!resultSourceMap) return result;
  const resolveDocument = createSourceDocumentResolver(getCachedDocument, perspective), cachedDocuments = resultSourceMap.documents?.map?.(resolveDocument) || [];
  return resolveEditInfo.walkMap(JSON.parse(JSON.stringify(result)), (value, path) => {
    const resolveMappingResult = resolveEditInfo.resolveMapping(path, resultSourceMap);
    if (!resolveMappingResult)
      return value;
    const { mapping, pathSuffix } = resolveMappingResult;
    if (mapping.type !== "value" || mapping.source.type !== "documentValue")
      return value;
    const sourceDocument = resultSourceMap.documents[mapping.source.document], sourcePath = resultSourceMap.paths[mapping.source.path];
    if (sourceDocument) {
      const parsedPath = resolveEditInfo.parseJsonPath(sourcePath + pathSuffix), stringifiedPath = resolveEditInfo.toString(parsedPath), cachedDocument = cachedDocuments[mapping.source.document];
      if (!cachedDocument)
        return value;
      const changedValue = cachedDocument ? resolveEditInfo.get(cachedDocument, stringifiedPath, value) : value;
      return value === changedValue ? value : updateFn(changedValue, {
        cachedDocument,
        previousValue: value,
        sourceDocument,
        sourcePath: parsedPath
      });
    }
    return value;
  });
}
function resolvedKeyedSourcePath(options) {
  const { keyedResultPath, pathSuffix, sourceBasePath } = options, inferredResultPath = pathSuffix === void 0 ? [] : resolveEditInfo.parseJsonPath(pathSuffix), inferredPath = keyedResultPath.slice(keyedResultPath.length - inferredResultPath.length), inferredPathSuffix = inferredPath.length ? resolveEditInfo.jsonPath(inferredPath).slice(1) : "";
  return resolveEditInfo.parseJsonPath(sourceBasePath + inferredPathSuffix);
}
function resolveEditUrl(options) {
  const { resultSourceMap, studioUrl } = options, resultPath = resolveEditInfo.studioPathToJsonPath(options.resultPath), editInfo = resolveEditInfo.resolveEditInfo({
    resultPath,
    resultSourceMap,
    studioUrl
  });
  if (editInfo)
    return resolveEditInfo.createEditUrl(editInfo);
}
exports.DRAFTS_FOLDER = resolveEditInfo.DRAFTS_FOLDER;
exports.VERSION_FOLDER = resolveEditInfo.VERSION_FOLDER;
exports.createEditUrl = resolveEditInfo.createEditUrl;
exports.getDraftId = resolveEditInfo.getDraftId;
exports.getPublishedId = resolveEditInfo.getPublishedId;
exports.getVersionFromId = resolveEditInfo.getVersionFromId;
exports.getVersionId = resolveEditInfo.getVersionId;
exports.isDraftId = resolveEditInfo.isDraftId;
exports.isPublishedId = resolveEditInfo.isPublishedId;
exports.isVersionId = resolveEditInfo.isVersionId;
exports.jsonPath = resolveEditInfo.jsonPath;
exports.jsonPathToStudioPath = resolveEditInfo.jsonPathToStudioPath;
exports.parseJsonPath = resolveEditInfo.parseJsonPath;
exports.resolveEditInfo = resolveEditInfo.resolveEditInfo;
exports.resolveMapping = resolveEditInfo.resolveMapping;
exports.studioPath = resolveEditInfo.studioPath;
exports.studioPathToJsonPath = resolveEditInfo.studioPathToJsonPath;
exports.walkMap = resolveEditInfo.walkMap;
exports.applySourceDocuments = applySourceDocuments;
exports.resolveEditUrl = resolveEditUrl;
exports.resolvedKeyedSourcePath = resolvedKeyedSourcePath;
//# sourceMappingURL=csm.cjs.map
