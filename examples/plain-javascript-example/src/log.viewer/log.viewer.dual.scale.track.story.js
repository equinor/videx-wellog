import {
  LogViewer, DualScaleTrack, InterpolatedScaleHandler
} from '../../../../src';

const btnMode = (viewer) => {
  const btn = document.createElement('button');
  btn.style.width = '200px';
  btn.style.height = '40px';
  btn.style.marginTop = '16px';

  btn.innerHTML = 'switch mode';

  let mode = viewer.scaleHandler.mode || 0;
  btn.onclick = () => {
    mode = !(parseInt(mode, 10)) ? 1 : 0;
    viewer.scaleHandler.setMode(mode);
    viewer.adjustZoomTransform();
    viewer.rescale();
  };
  return btn;
};

export const logViewerMultipleDualScaleTracks = () => {
  const root = document.createElement('div');
  const div = document.createElement('div');
  div.style.width = '500px';
  div.style.height = '500px';

  const scaleTrack1 = new DualScaleTrack('scale multiplied by 2', { maxWidth: 180, mode: 1 });
  const scaleTrack2 = new DualScaleTrack('scale divided by 2', { maxWidth: 180, mode: 0 });
  const viewer = LogViewer.basic().setTracks(scaleTrack1, scaleTrack2);

  const forward = v => v / 2;
  const reverse = v => v * 2;
  const interpolator = {
    forward,
    reverse,
    forwardInterpolatedDomain: domain => domain.map(v => forward(v)),
    reverseInterpolatedDomain: domain => domain.map(v => reverse(v)),
  };
  const scaleHandler = new InterpolatedScaleHandler(interpolator, [-10, 100]).range([0, 500]);

  viewer.scaleHandler = scaleHandler;

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div);
  });

  root.appendChild(div);
  root.appendChild(btnMode(viewer));

  return root;
};
