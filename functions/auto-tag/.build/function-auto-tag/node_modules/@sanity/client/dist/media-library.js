function isSignedPlayback(item) {
  return "token" in item;
}
function isSignedPlaybackInfo(playbackInfo) {
  return isSignedPlayback(playbackInfo.stream);
}
function getPlaybackTokens(playbackInfo) {
  if (isSignedPlaybackInfo(playbackInfo))
    return {
      stream: playbackInfo.stream.token,
      thumbnail: playbackInfo.thumbnail.token,
      storyboard: playbackInfo.storyboard.token,
      animated: playbackInfo.animated.token
    };
}
export {
  getPlaybackTokens,
  isSignedPlaybackInfo
};
//# sourceMappingURL=media-library.js.map
