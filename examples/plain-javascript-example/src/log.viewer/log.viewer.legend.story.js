import {
  LogViewer,
} from '../../../../src';
import createTracks from '../shared/tracks';

export const logViewerLegend = () => {
  const div = document.createElement('div');

  const viewer = new LogViewer();

  const tracks = createTracks();

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer
      .init(div)
      .setTracks(tracks);
  });

  return div;
};
