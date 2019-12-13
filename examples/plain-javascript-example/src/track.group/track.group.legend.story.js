import {
  TrackGroup,
} from '../../../../src';
import createTracks from '../shared/tracks';

export const trackGroupLegend = () => {
  const div = document.createElement('div');

  const trackGroup = new TrackGroup();

  const tracks = createTracks();

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup
      .init(div)
      .setTracks(tracks)
      .zoomTo(
        [900, 960],
        1000,
        () => trackGroup.zoomTo(
          [200, 400],
          2000,
          () => trackGroup.zoomTo(
            [400, 600],
            1000,
          ),
        ),
      );
  });

  return div;
};
