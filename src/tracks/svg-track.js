import { select } from 'd3';
import Track from './track';
import { setStyles } from '../utils';

/**
 * Base track for tracks that renders SVG content
 */
export default class SvgTrack extends Track {
  /**
   * Override to add SVG container for plotting track data
   * @param {object} trackEvent
   */
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.plotGroup = select(trackEvent.elm).append('svg').style('position', 'absolute');
  }

  /**
   * Override to scale SVG container on resize
   * @param {object} trackEvent
   */
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    setStyles(this.plotGroup, {
      height: `${this.elm.clientHeight}px`,
      width: `${this.elm.clientWidth}px`,
    });
  }
}
