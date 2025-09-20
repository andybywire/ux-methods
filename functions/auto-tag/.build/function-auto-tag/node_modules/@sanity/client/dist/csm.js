import { getVersionId, getDraftId, getPublishedId, walkMap, resolveMapping, parseJsonPath, toString, get, jsonPath, studioPathToJsonPath, resolveEditInfo, createEditUrl } from "./_chunks-es/resolveEditInfo.js";
import { DRAFTS_FOLDER, VERSION_FOLDER, getVersionFromId, isDraftId, isPublishedId, isVersionId, jsonPathToStudioPath, studioPath } from "./_chunks-es/resolveEditInfo.js";
import { validateApiPerspective } from "./_chunks-es/config.js";
function resolvePerspectives(perspective) {
  if (validateApiPerspective(perspective), Array.isArray(perspective))
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
        _id: getVersionId(sourceDocument._id, perspective)
      })), perspective === "drafts" && (match = getCachedDocument({
        ...sourceDocument,
        _id: getDraftId(sourceDocument._id)
      })), perspective === "published" && (match = getCachedDocument({
        ...sourceDocument,
        _id: getPublishedId(sourceDocument._id)
      })), match)
        return { ...match, _id: getPublishedId(match._id), _originalId: match._id };
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
  return walkMap(JSON.parse(JSON.stringify(result)), (value, path) => {
    const resolveMappingResult = resolveMapping(path, resultSourceMap);
    if (!resolveMappingResult)
      return value;
    const { mapping, pathSuffix } = resolveMappingResult;
    if (mapping.type !== "value" || mapping.source.type !== "documentValue")
      return value;
    const sourceDocument = resultSourceMap.documents[mapping.source.document], sourcePath = resultSourceMap.paths[mapping.source.path];
    if (sourceDocument) {
      const parsedPath = parseJsonPath(sourcePath + pathSuffix), stringifiedPath = toString(parsedPath), cachedDocument = cachedDocuments[mapping.source.document];
      if (!cachedDocument)
        return value;
      const changedValue = cachedDocument ? get(cachedDocument, stringifiedPath, value) : value;
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
  const { keyedResultPath, pathSuffix, sourceBasePath } = options, inferredResultPath = pathSuffix === void 0 ? [] : parseJsonPath(pathSuffix), inferredPath = keyedResultPath.slice(keyedResultPath.length - inferredResultPath.length), inferredPathSuffix = inferredPath.length ? jsonPath(inferredPath).slice(1) : "";
  return parseJsonPath(sourceBasePath + inferredPathSuffix);
}
function resolveEditUrl(options) {
  const { resultSourceMap, studioUrl } = options, resultPath = studioPathToJsonPath(options.resultPath), editInfo = resolveEditInfo({
    resultPath,
    resultSourceMap,
    studioUrl
  });
  if (editInfo)
    return createEditUrl(editInfo);
}
export {
  DRAFTS_FOLDER,
  VERSION_FOLDER,
  applySourceDocuments,
  createEditUrl,
  getDraftId,
  getPublishedId,
  getVersionFromId,
  getVersionId,
  isDraftId,
  isPublishedId,
  isVersionId,
  jsonPath,
  jsonPathToStudioPath,
  parseJsonPath,
  resolveEditInfo,
  resolveEditUrl,
  resolveMapping,
  resolvedKeyedSourcePath,
  studioPath,
  studioPathToJsonPath,
  walkMap
};
//# sourceMappingURL=csm.js.map
