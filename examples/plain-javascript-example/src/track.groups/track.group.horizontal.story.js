
import {
  TrackGroup,
} from '../../../../src';
import tracks from './tracks';

export const withTrackGroupHorizontal = () => {
  const div = document.createElement('div');
  div.className = 'demo';

  const trackGroup = new TrackGroup({
    showLegend: true,
    horizontal: true,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup
      .init(div)
      .setTracks(tracks);
  });

  return div;
};
