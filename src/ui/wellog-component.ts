import {
  select,
} from 'd3';
import { setStyles, UIHelper } from '../utils';
import {
  Margin,
  RubberBandUpdateEvent,
  RubberBandExitEvent,
  TrackGroupOptions,
} from './interfaces';
import TrackGroup from './track-group';

export interface WellogOptions extends TrackGroupOptions {
  margin?: Margin,
  showRubberband?: boolean,
  rubberbandSize?: number,
  rubberbandUpdate?: (event: RubberBandUpdateEvent) => void,
  rubberbandExit?: (event: RubberBandExitEvent) => void,
}

const defaultOptions : WellogOptions = {
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  showRubberband: true,
  rubberbandSize: 6,
  onTrackEnter: (elm, track) => {
    const loader = select(elm).append('div').classed('loader hidden', true);
    for (let i = 0; i < 3; i++) {
      loader.append('div').classed('loading-dots', true);
    }
    track.loader = loader.node();
  },
};

/**
 * A container component for wellog tracks. Extends TrackGroup and
 * adds loaders and rubber band tracing.
 */
export default class WellogComponent extends TrackGroup {
  public options: WellogOptions;
  public root: any;

  constructor(options: WellogOptions = {}) {
    super({
      ...defaultOptions,
      ...options,
      horizontal: false,
    });

    this.root = null;
    this.init = this.init.bind(this);
  }

  /**
   * Initializes the component and attach itself to the provided DOM element.
   */
  init(elm: HTMLElement) : WellogComponent {
    const { margin } = this.options;
    const root = select(elm).classed('well-log', true);

    setStyles(root, {
      position: 'relative',
      margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    });

    const main = root
      .append('div')
      .classed('main-group', true);

    super.init(main.node());

    if (this.options.useOverlay && this.options.showRubberband) {
      let size = Math.round(this.options.rubberbandSize);
      if (size % 2 === 0) { // need an odd number of pixels
        size++;
      }
      const offset = (size - 1) / 2;
      const _self = this;
      const rbelm = this.overlay.add('rubber-band', {
        onMouseMove: event => {
          const { x, y } = event;
          event.target.style.top = `${y - (offset + 0.5)}px`;
          event.target.style.visibility = 'visible';

          if (_self.options.rubberbandUpdate) {
            _self.options.rubberbandUpdate({
              x,
              y,
              source: _self,
              getTrackElement: () => UIHelper.pickHStackedElement(
                _self.tracks.map(d => d.elm),
                x,
              ),
              getTrackDatum: () => {
                const el = UIHelper.pickHStackedElement(
                  _self.tracks.map(d => d.elm),
                  x,
                );
                if (el) return select(el).datum();
                return null;
              },
            });
          }
        },
        onMouseExit: event => {
          event.target.style.visibility = 'hidden';
          if (_self.options.rubberbandExit) {
            _self.options.rubberbandExit({
              source: _self,
            });
          }
        }
      });

      const rb = select(rbelm).classed('rubber-band', true)
        .style('height', `${size}px`)
        .style('background-color', 'rgba(255,0,0,0.1)')
        .style('visibility', 'hidden');

      rb.append('div')
        .style('height', '1px')
        .style('background-color', 'rgba(255,0,0,0.7)')
        .style('position', 'relative')
        .style('top', `${offset}px`);
    }

    this.root = root;
    return this;
  }
}
