import { BasicTrackViewer } from '../../../../src/index';
import { scaleTrack, formationTrack } from '../shared/standard-tracks';

export const withFormationTrack = () => {
  const div = document.createElement('div');

  div.style.width = '200px';
  div.style.height = '500px';

  const trackViewer = new BasicTrackViewer([scaleTrack, formationTrack], [0, 1500]);

  requestAnimationFrame(() => trackViewer.init(div));
  return div;
};

