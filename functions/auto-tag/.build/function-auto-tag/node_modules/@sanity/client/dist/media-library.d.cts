/**
 * Extract playback tokens from signed video playback info
 * @param playbackInfo - The video playback info
 * @returns The playback tokens or undefined if the response is not signed
 * @public
 * @example
 * const tokens = getPlaybackTokens(playbackInfo)
 * console.log(tokens)
 * ```json
 * {
 *    stream: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
 *    thumbnail: "eyJ0a2VuIjoiVGh1bWJuYWlsVG9rZW4tMTIz...",
 *    animated: "eyJ0a2VuIjoiQW5pbWF0ZWRUb2tlbi1kZWY...",
 *    storyboard: "eyJ0a2VuIjoiU3Rvcnlib2FyZFRva2VuLTc4..."
 * }
 * ```
 */
export declare function getPlaybackTokens(
  playbackInfo: VideoPlaybackInfo,
): VideoPlaybackTokens | undefined

/**
 * Check if the entire playback info response requires signed URLs
 * @public
 */
export declare function isSignedPlaybackInfo(
  playbackInfo: VideoPlaybackInfo,
): playbackInfo is VideoPlaybackInfoSigned

/** @public */
declare interface VideoPlaybackInfo<T extends VideoPlaybackInfoItem = VideoPlaybackInfoItem> {
  id: string
  thumbnail: T
  animated: T
  storyboard: T
  stream: T
  duration: number
  aspectRatio: number
}

/** @public */
declare type VideoPlaybackInfoItem = VideoPlaybackInfoItemPublic | VideoPlaybackInfoItemSigned

/** @public */
declare interface VideoPlaybackInfoItemPublic {
  url: string
}

/** @public */
declare interface VideoPlaybackInfoItemSigned extends VideoPlaybackInfoItemPublic {
  token: string
}

/** @public */
declare type VideoPlaybackInfoSigned = VideoPlaybackInfo<VideoPlaybackInfoItemSigned>

/** @public */
declare interface VideoPlaybackTokens {
  stream?: string
  thumbnail?: string
  storyboard?: string
  animated?: string
}

export {}
