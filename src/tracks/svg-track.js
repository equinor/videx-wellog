import { select } from 'd3';
import Track from './track';

export default class SvgTrack extends Track {
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.plotGroup = select(trackEvent.elm).append('svg').styles({
      position: 'absolute',
    });
  }

  // override
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    this.plotGroup.styles({
      height: `${this.elm.clientHeight}px`,
      width: `${this.elm.clientWidth}px`,
    });
  }
}
