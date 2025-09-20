/**
 * Used to tag types that is set to `any` as a temporary measure, but should be replaced with proper typings in the future
 * @internal
 */
export declare type Any = any

/**
 * Optimistically applies source documents to a result, using the content source map to trace fields.
 * Can be used to apply mutations to documents being edited in a Studio, or any mutation on Content Lake, to a result with extremely low latency.
 * @alpha
 */
export declare function applySourceDocuments<Result = unknown>(
  result: Result,
  resultSourceMap: ContentSourceMap | undefined,
  getCachedDocument: (
    sourceDocument: ContentSourceMapDocuments[number],
  ) =>
    | (Partial<SanityDocument> & Required<Pick<SanityDocument, '_id' | '_type'>>)
    | null
    | undefined,
  updateFn: ApplySourceDocumentsUpdateFunction,
  perspective: Exclude<ClientPerspective, 'raw'>,
): Result

/**
 * @alpha
 */
export declare type ApplySourceDocumentsUpdateFunction = <T = unknown>(
  changedValue: T,
  context: {
    cachedDocument: Partial<SanityDocument>
    previousValue: T
    sourceDocument: ContentSourceMapDocuments[number]
    sourcePath: ContentSourceMapParsedPath
  },
) => T

/** @public */
export declare type ClientPerspective =
  | DeprecatedPreviewDrafts
  | 'published'
  | 'drafts'
  | 'raw'
  | StackablePerspective[]

/** @public */
export declare interface ContentSourceMap {
  mappings: ContentSourceMapMappings
  documents: ContentSourceMapDocuments
  paths: ContentSourceMapPaths
}

/** @public */
export declare interface ContentSourceMapDocument extends ContentSourceMapDocumentBase {
  _projectId?: undefined
  _dataset?: undefined
}

/** @public */
export declare interface ContentSourceMapDocumentBase {
  _id: string
  _type: string
}

/** @public */
export declare type ContentSourceMapDocuments = (
  | ContentSourceMapDocument
  | ContentSourceMapRemoteDocument
)[]

/**
 * DocumentValueSource is a path to a value within a document
 * @public
 */
export declare interface ContentSourceMapDocumentValueSource {
  type: 'documentValue'
  document: number
  path: number
}

/**
 * When a value is not from a source, its a literal
 * @public
 */
export declare interface ContentSourceMapLiteralSource {
  type: 'literal'
}

/** @public */
export declare type ContentSourceMapMapping = ContentSourceMapValueMapping

/** @public */
export declare type ContentSourceMapMappings = Record<string, ContentSourceMapMapping>

/** @alpha */
export declare type ContentSourceMapParsedPath = (
  | string
  | number
  | ContentSourceMapParsedPathKeyedSegment
)[]

/** @alpha */
export declare type ContentSourceMapParsedPathKeyedSegment = {
  _key: string
  _index: number
}

/**
 * @alpha
 * @deprecated use `ContentSourceMapParsedPath[number]` instead
 */
export declare type ContentSourceMapParsedPathSegment = ContentSourceMapParsedPath[number]

/** @public */
export declare type ContentSourceMapPaths = string[]

/** @public */
export declare interface ContentSourceMapRemoteDocument extends ContentSourceMapDocumentBase {
  _projectId: string
  _dataset: string
}

/** @public */
export declare type ContentSourceMapSource =
  | ContentSourceMapDocumentValueSource
  | ContentSourceMapLiteralSource
  | ContentSourceMapUnknownSource

/**
 * When a field source is unknown
 * @public
 */
export declare interface ContentSourceMapUnknownSource {
  type: 'unknown'
}

/**
 * ValueMapping is a mapping when for value that is from a single source value
 * It may refer to a field within a document or a literal value
 * @public
 */
export declare interface ContentSourceMapValueMapping {
  type: 'value'
  source: ContentSourceMapSource
}

/** @internal */
export declare function createEditUrl(
  options: CreateEditUrlOptions,
): `${StudioBaseUrl}${EditIntentUrl}`

/** @internal */
export declare interface CreateEditUrlOptions {
  baseUrl: string
  workspace?: string
  tool?: string
  id: string
  type: string
  path: ContentSourceMapParsedPath | string
  projectId?: string
  dataset?: string
}

/**
 * @deprecated use 'drafts' instead
 */
declare type DeprecatedPreviewDrafts = 'previewDrafts'

/** @internal */
export declare type DraftId = Opaque<string, 'draftId'>

/** @internal */
export declare const DRAFTS_FOLDER = 'drafts'

/** @alpha */
export declare type EditIntentUrl =
  `/intent/edit/mode=presentation;id=${string};type=${string};path=${string}`

/** @alpha */
declare function fromString(path: string): Path

/** @internal */
declare function get<Result = unknown, Fallback = unknown>(
  obj: unknown,
  path: Path | string,
  defaultVal?: Fallback,
): Result | typeof defaultVal

/** @internal */
export declare function getDraftId(id: string): DraftId

/** @internal */
export declare function getPublishedId(id: string): PublishedId

/**
 *  @internal
 *  Given an id, returns the versionId if it exists.
 *  e.g. `versions.summer-drop.foo` = `summer-drop`
 *  e.g. `drafts.foo` = `undefined`
 *  e.g. `foo` = `undefined`
 */
export declare function getVersionFromId(id: string): string | undefined

/**  @internal */
export declare function getVersionId(id: string, version: string): string

/** @alpha */
export declare type IndexTuple = [number | '', number | '']

/** @internal */
export declare function isDraftId(id: string): id is DraftId

/** @internal */
declare function isIndexSegment(segment: PathSegment): segment is number

/** @internal */
declare function isIndexTuple(segment: PathSegment): segment is IndexTuple

/** @internal */
declare function isKeySegment(segment: PathSegment): segment is KeyedSegment

/** @internal */
export declare function isPublishedId(id: string): id is PublishedId

/** @internal */
export declare function isVersionId(id: string): boolean

/**
 * @internal
 */
export declare function jsonPath(path: ContentSourceMapParsedPath): ContentSourceMapPaths[number]

/**
 * @internal
 */
export declare function jsonPathToStudioPath(path: ContentSourceMapParsedPath): Path

/** @alpha */
export declare type KeyedSegment = {
  _key: string
}

declare type Opaque<T, K> = T & {
  __opaqueId__: K
}

/**
 * @internal
 */
export declare function parseJsonPath(
  path: ContentSourceMapPaths[number],
): ContentSourceMapParsedPath

/** @alpha */
export declare type Path = PathSegment[]

/** @alpha */
export declare type PathSegment = string | number | KeyedSegment | IndexTuple

/** @internal */
export declare type PublishedId = Opaque<string, 'publishedId'>

/** @internal */
declare const reKeySegment: RegExp

/**
 * @internal
 */
export declare function resolvedKeyedSourcePath(options: {
  keyedResultPath: ContentSourceMapParsedPath
  pathSuffix?: string
  sourceBasePath: string
}): ContentSourceMapParsedPath

/** @internal */
export declare function resolveEditInfo(
  options: ResolveEditInfoOptions,
): CreateEditUrlOptions | undefined

/** @alpha */
export declare interface ResolveEditInfoOptions {
  studioUrl: StudioUrl | ResolveStudioUrl
  resultSourceMap: ContentSourceMap
  resultPath: ContentSourceMapParsedPath
}

/** @alpha */
export declare function resolveEditUrl(
  options: ResolveEditUrlOptions,
): ReturnType<typeof createEditUrl> | undefined

/** @alpha */
export declare interface ResolveEditUrlOptions extends Omit<ResolveEditInfoOptions, 'resultPath'> {
  resultPath: StudioPathLike
}

/**
 * @internal
 */
export declare function resolveMapping(
  resultPath: ContentSourceMapParsedPath,
  csm?: ContentSourceMap,
):
  | {
      mapping: ContentSourceMapMapping
      matchedPath: string
      pathSuffix: string
    }
  | undefined

/** @alpha */
export declare type ResolveStudioUrl = (
  sourceDocument: ContentSourceMapDocuments[number],
) => StudioUrl

/** @internal */
export declare type SanityDocument<T extends Record<string, Any> = Record<string, Any>> = {
  [P in keyof T]: T[P]
} & {
  _id: string
  _rev: string
  _type: string
  _createdAt: string
  _updatedAt: string
  /**
   * Present when `perspective` is set to `previewDrafts`
   */
  _originalId?: string
}

/** @public */
declare type StackablePerspective = ('published' | 'drafts' | string) & {}

/** @alpha */
export declare type StudioBaseRoute = {
  baseUrl: StudioBaseUrl
  workspace?: string
  tool?: string
}

/** @alpha */
export declare type StudioBaseUrl =
  | `/${string}`
  | `${string}.sanity.studio`
  | `https://${string}`
  | string

declare namespace studioPath {
  export {
    isIndexSegment,
    isKeySegment,
    isIndexTuple,
    get,
    toString_2 as toString,
    fromString,
    KeyedSegment,
    IndexTuple,
    PathSegment,
    Path,
    reKeySegment,
  }
}
export {studioPath}

/**
 * Path syntax as used by the `sanity` package, you can give it a string:
 * `products[0].images[_key=="abc123"].asset._ref`
 * or an array:
 * `['products', 0, 'images', {_key: 'abc123'}, 'asset', '_ref']`
 * @alpha
 */
export declare type StudioPathLike = Path | string

/**
 * @internal
 */
export declare function studioPathToJsonPath(path: Path | string): ContentSourceMapParsedPath

/** @alpha */
export declare type StudioUrl = StudioBaseUrl | StudioBaseRoute

/** @alpha */
declare function toString_2(path: Path): string

/** @internal */
export declare const VERSION_FOLDER = 'versions'

/**
 * generic way to walk a nested object or array and apply a mapping function to each value
 * @internal
 */
export declare function walkMap(
  value: unknown,
  mappingFn: WalkMapFn,
  path?: ContentSourceMapParsedPath,
): unknown

/**
 * @internal
 */
export declare type WalkMapFn = (value: unknown, path: ContentSourceMapParsedPath) => unknown

export {}
