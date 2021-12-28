import {
  StackedTrack,
  ScaleTrack,
  LogViewer,
} from '../../../../src';
import { ex4 } from '../shared/mock-data';

export const logViewerFormationTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const viewer = new LogViewer();

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const formationTrack = new StackedTrack('formation', {
    data: ex4,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div).setTracks([scaleTrack, formationTrack]);
  });

  return div;
};
