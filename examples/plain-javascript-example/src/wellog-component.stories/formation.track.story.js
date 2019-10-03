import { create } from 'd3-selection';
import { WellogComponent, UIHelper } from '../../../../src/index';
import { scaleTrack, formationTrack } from '../shared/standard-tracks';

// creates and hook up wellog component
function createComponent(wellogNode, options) {
  const instance = new WellogComponent(options);
  instance.init(wellogNode.node());
  instance.domain = [0, 1500];
  instance.setTracks(scaleTrack, formationTrack);
}

// output readout from rubberband position
function readout(selection) {
  const event = selection.datum();
  const tracks = event.source.tracks;
  const track = UIHelper.findTrackByXPosition(tracks, event.x);
  selection.selectAll('*').remove();
  const eventInfo = selection.append('div');
  eventInfo.append('h3').text('Readout Info');
  eventInfo.append('p').text(d => `Depth (MD): ${Math.round(d.source.scaleHandler.scale.invert(d.y) * 10) / 10} meters`);
  eventInfo.append('p').text(d => `Mouse X: ${d.x}`);
  eventInfo.append('p').text(d => `Mouse Y: ${d.y}`);
  if (track) {
    eventInfo.append('div').text(`Track: ${track.options.label}`);
  }
}

export const withFormationTrack = () => {
  // create HTML container elements
  const container = create('div')
    .style('width', '100%')
    .style('height', '600px')
    .style('display', 'flex')
    .style('flex-direction', 'flex-column');

  const wellogNode = container.append('div')
    .classed('well-log', true)
    .style('max-width', '85px');

  const readoutNode = container.append('div')
    .classed('readout', true)
    .style('padding-left', '20px')
    .style('font', '14px verdana');

  const wellogOptions = {
    rubberbandUpdate: event => readoutNode.datum(event).call(readout),
    rubberbandExit: () => readoutNode.selectAll('*').remove(),
  };

  // ensure that wellog component is created after DOM elements are
  // available in the DOM model/document
  requestAnimationFrame(() => createComponent(wellogNode, wellogOptions));

  // return root node to Storybook
  return container.node();
};

