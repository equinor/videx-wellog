import {
  StackedTrack,
  ScaleTrack,
  LogViewer,
} from '../../../../src';
import { ex6 } from '../shared/mock-data';

export const logViewerFlagTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const viewer = new LogViewer();

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const flagTrack = new StackedTrack('id', {
    data: ex6,
    showLabels: false,
    showLines: false,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div).setTracks([scaleTrack, flagTrack]);
  });

  return div;
};
