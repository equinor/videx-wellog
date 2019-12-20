
import {
  LogViewer,
} from '../../../../src';
import createTracks from '../shared/tracks';

export const logViewerHorizontal = () => {
  const div = document.createElement('div');

  const viewer = new LogViewer({
    showLegend: true,
    horizontal: true,
  });

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
