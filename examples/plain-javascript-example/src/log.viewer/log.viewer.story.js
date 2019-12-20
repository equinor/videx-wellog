import {
  LogViewer, ScaleTrack,
} from '../../../../src';

export const logViewerSingleTrack = () => {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale');
  const viewer = LogViewer.basic(false).addTrack(scaleTrack);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div);
  });

  return div;
};
