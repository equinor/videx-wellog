import {
  LogViewer, ScaleTrack, GraphTrack,
} from '../../../../src';
import {
  CorePhotosTrack
} from '../track/track.stories';
import { Plugs, Photos } from '../shared/core.json';

export const logViewerMultipleTracks = () => {
  const div = document.createElement('div');
  div.style.width = '500px';
  div.style.height = '500px';
  div.style.background = '#aaaa';

  const images = Photos.map((c) => {
    const range = c.depthRange.split('-');

    return {
      from: parseInt(range[0], 10),
      to: parseInt(range[1], 10),
      url: c.url,
      index: c.section,
      lighting: c.lighting,
    };
  });

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const graphTrack1 = new GraphTrack('graph1', { width: 2 });
  const graphTrack2 = new GraphTrack('graph2');
  const coreTrack = new CorePhotosTrack('core photos', {
    data: () => new Promise(resolve => resolve({ images, plugs: Plugs })),
  });

  const viewer = LogViewer.basic().setTracks(scaleTrack, graphTrack1, graphTrack2, coreTrack);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    viewer.init(div);
  });

  return div;
};
