import {
  LogController,
} from '../../../../src';
import createTracks from '../shared/tracks';

export const logControllerLegend = () => {
  const div = document.createElement('div');

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
