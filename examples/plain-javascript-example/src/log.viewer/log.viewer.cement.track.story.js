import {
  StackedTrack,
  ScaleTrack,
  LogViewer,
} from '../../../../src';
import { ex5 } from '../shared/mock-data';

export const logViewerCementTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const viewer = new LogViewer();

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const cementTrack = new StackedTrack('id', {
    data: ex5,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div).setTracks([scaleTrack, cementTrack]);
  });

  return div;
};
