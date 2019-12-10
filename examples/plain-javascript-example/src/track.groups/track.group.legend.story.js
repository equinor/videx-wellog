import {
  TrackGroup,
} from '../../../../src';
import createTracks from './tracks';

export const trackGroupLegend = () => {
  const div = document.createElement('div');
  div.className = 'demo';

  const trackGroup = new TrackGroup();

  const tracks = createTracks();

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup
      .init(div)
      .setTracks(tracks);
  });

  return div;
};
