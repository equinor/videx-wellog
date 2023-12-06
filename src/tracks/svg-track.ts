import { select } from 'd3';
import Track from './track';
import { setStyles } from '../utils';
import { D3Selection } from '../common/interfaces';
import { OnMountEvent, OnUpdateEvent } from './interfaces';

/**
 * Base track for tracks that renders SVG content
 */
export default abstract class SvgTrack extends Track {
  protected plotGroup: D3Selection;
  public elm: HTMLElement;

  /**
   * Override to add SVG container for plotting track data
   */
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
    this.plotGroup = select(trackEvent.elm).append('svg').style('position', 'absolute');
  }

  /**
   * Override to scale SVG container on resize
   */
  onUpdate(trackEvent: OnUpdateEvent) : void {
    super.onUpdate(trackEvent);
    setStyles(this.plotGroup, {
      height: `${this.elm.clientHeight}px`,
      width: `${this.elm.clientWidth}px`,
    });
  }
}
