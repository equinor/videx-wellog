import {
  TrackGroup, ScaleTrack,
} from '../../../../src';

export const trackGroup = () => {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale');
  const trackGroup = TrackGroup.basic(false).addTrack(scaleTrack);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup.init(div);
  });

  return div;
};
