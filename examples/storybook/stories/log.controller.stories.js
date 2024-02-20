import {
  LogController, ScaleTrack, GraphTrack
} from '../../../src';

import createTracks from './shared/tracks';

export default  {
  title: "Log Controller",
};

export const logControllerWithArgs = {
  render: (args) => {
    const div = document.createElement('div');
    div.style.height = '95vh';

    const logController = new LogController({
      showLegend: args.showLegend,
      showTitles: args.showTitles,
      horizontal: args.horizontal,
    });

    const tracks = createTracks();

    // create zoomTo animation
    const sequence = [
      [[900, 960], 2500],
      [[200, 300], 2000],
      [[300, 400], 2000],
      [[310, 410], 1000],
      [[350, 450], 3000],
      [[500, 700], 1000],
    ];

    let i = 0;
    const createAnimationStep = () => {
      if (i === sequence.length) i = 0;
      const [dom, dur] = sequence[i++];

      return () => logController.zoomTo(dom, dur, createAnimationStep());
    };

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      logController
        .init(div)
        .setTracks(tracks);
      if( args.animation ) {
      createAnimationStep()();
      }
    });

    return div;
  },
  args:{
    showLegend: true,
    showTitles: true,
    horizontal: true,
    animation: true,
  },
};

// log.controller.horizontal.story
export const logControllerHorizontal = () => {
  const div = document.createElement('div');
  div.style.height = '95vh';

  const logController = new LogController({
    showLegend: true,
    showTitles: true,
    horizontal: false,
  });

  const tracks = createTracks();

  // create zoomTo animation
  const sequence = [
    [[900, 960], 2500],
    [[200, 300], 2000],
    [[300, 400], 2000],
    [[310, 410], 1000],
    [[350, 450], 3000],
    [[500, 700], 1000],
  ];

  let i = 0;
  const createAnimationStep = () => {
    if (i === sequence.length) i = 0;
    const [dom, dur] = sequence[i++];

    return () => logController.zoomTo(dom, dur, createAnimationStep());
  };

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    logController
      .init(div)
      .setTracks(tracks);

    createAnimationStep()();
  });

  return div;
};

// log.controller.legend.story
export const logControllerLegend = () => {
  const div = document.createElement('div');
  div.style.height = '500px';

  const logController = new LogController();

  const tracks = createTracks();

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    logController
      .init(div)
      .setTracks(tracks)
      .zoomTo(
        [900, 960],
        1000,
        () => logController.zoomTo(
          [200, 400],
          2000,
          () => logController.zoomTo(
            [400, 600],
            1000,
          ),
        ),
      );
  });

  return div;
};

// log.controller.multiple.tracks.story
export const logControllerMultipleTracks = () => {
  const div = document.createElement('div');
  div.style.width = '500px';
  div.style.height = '500px';

  const scaleTrack = new ScaleTrack('scale', { maxWidth: 60 });
  const graphTrack1 = new GraphTrack('graph1', { width: 2 });
  const graphTrack2 = new GraphTrack('graph2');
  const logController = LogController.basic().setTracks(scaleTrack, graphTrack1, graphTrack2);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    logController.init(div)
      .zoomTo([900, 960], 1000);
  });

  return div;
};

// log.controller.story
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