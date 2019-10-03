/**
 * Find and return the track instance positioned at a given
 * x-coordinate of the tracks container element.
 * NOTE: Requires tracks to be within the same containing DOM element
 * and that the tracks are stacked horizontally.
 * @param {Track[]} tracks Tracks to search.
 * @param {number} xpos X position
 */
function findTrackByXPosition(tracks, xpos) {
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const { elm } = track;
    if (xpos >= elm.offsetLeft && xpos <= elm.offsetLeft + elm.clientWidth) {
      return track;
    }
  }
  return null;
}

export default {
  findTrackByXPosition,
};
