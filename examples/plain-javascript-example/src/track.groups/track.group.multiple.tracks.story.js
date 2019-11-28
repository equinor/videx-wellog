import {
  TrackGroup, ScaleTrack, GraphTrack,
} from '../../../../src';

export const withTrackGroupMultipleTracks = () => {
  const div = document.createElement('div');
  div.style.width = '500px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const graphTrack1 = new GraphTrack('graph1', { width: 2 });
  const graphTrack2 = new GraphTrack('graph2');
  const trackGroup = TrackGroup.basic().setTracks(scaleTrack, graphTrack1, graphTrack2);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup.init(div);
  });

  return div;
};
