import {
    GraphTrack,
    StackedTrack,
    ScaleTrack,
    LogViewer,
    DualScaleTrack, 
    InterpolatedScaleHandler,
} from '../../../src';

import createTracks from './shared/tracks';
import { ex4, ex5, ex6 } from './shared/mock-data';
  
export default { title: 'Log Viewer' };

// log.viewer.story
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

// log.viewer.multiple.tracks.story
export const logViewerMultipleTracks = () => {
  const div = document.createElement('div');
  div.style.width = '500px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const graphTrack1 = new GraphTrack('graph1', { width: 2 });
  const graphTrack2 = new GraphTrack('graph2');
  const viewer = LogViewer.basic().setTracks(scaleTrack, graphTrack1, graphTrack2);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div);
  });

  return div;
};

// log.viewer.dual.scale.track.story
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

// log.viewer.multiple.tracks.story
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

// log.viewer.cement.track.story
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

// log.viewer.stacked.track.story
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

// log.viewer.flag.track.story
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

export const logViewerHorizontal = () => {
  const div = document.createElement('div');
  div.style.height = '95vh';

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

export const logViewerLegend = () => {
  const div = document.createElement('div');
  div.style.height = '95vh';

  const viewer = new LogViewer();

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
