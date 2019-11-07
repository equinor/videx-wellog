import { BasicTrackViewer } from '../../../../src/index';
import { scaleTrack } from '../shared/standard-tracks';

export const withScaleTrack = () => {
  const div = document.createElement('div');

  div.style.width = '60px';
  div.style.height = '500px';

  const trackViewer = new BasicTrackViewer([scaleTrack], [0, 1500]);

  requestAnimationFrame(() => trackViewer.init(div));
  return div;
};

