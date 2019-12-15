import {
  LogController, ScaleTrack,
} from '../../../../src';

export const logControllerSingleTrack = () => {
  const div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale');
  const logController = LogController.basic(false).addTrack(scaleTrack);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    logController.init(div).zoomTo([500, 600], 1000);
  });

  return div;
};
