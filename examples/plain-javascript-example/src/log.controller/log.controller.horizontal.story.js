
import {
  LogController,
} from '../../../../src';
import createTracks from '../shared/tracks';

export const logControllerHorizontal = () => {
  const div = document.createElement('div');

  const logController = new LogController({
    showLegend: true,
    horizontal: true,
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
