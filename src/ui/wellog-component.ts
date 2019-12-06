import {
  select,
  mouse,
} from 'd3';
import { setAttrs, setStyles, UIHelper } from '../utils';
import { Margin, RubberBandUpdateEvent, RubberBandExitEvent, TrackGroupOptions } from './interfaces';
import TrackGroup from './track-group';
import { D3Selection } from '../common/interfaces';

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

    if (this.options.overlay && this.options.showRubberband) {
      this.options.onResize = (event) => {
        this.updateRubberband(event.source.overlay, event.width, event.trackHeight);
      };
    }

    this.root = null;
    this.init = this.init.bind(this);

    this.updateRubberband = this.updateRubberband.bind(this);
  }

  /**
   * Initializes the component and attach itself to the provided DOM element.
   */
  init(elm: HTMLElement) : WellogComponent {
    const { margin } = this.options;
    const root = select(elm).classed('well-log', true);

    setStyles(root, {
      position: 'relative',
    });

    setStyles(root, {
      margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    });

    const main = root
      .append('div')
      .attr('class', 'main-group');

    super.init(main.node());

    this.root = root;
    return this;
  }

  /**
   * Updates the rubber band controller
   * @param rbc rubber band container
   * @param w width
   * @param h height
   */
  updateRubberband(rbc: D3Selection, w: number, h: number) {
    if (w <= 0 || h <= 0) return;

    let rb = rbc.select('rect.rubber-band');
    if (rb.empty()) {
      rb = rbc.append('rect')
        .classed('rubber-band', true)
        .attr('height', 1)
        .style('stroke-width', this.options.rubberbandSize);

      const rbs = rbc.append('rect');
      setAttrs(rbs, {
        class: 'tracker-rect',
        x: 0,
        y: 0,
        width: w,
        height: h,
        stroke: 'none',
        fill: 'transparent',
      });

      const _self = this;
      rbs.on('mousemove', function rbmm() {
        const [mx, my] = mouse(this);
        rb.attr('y', my - 2).style('visibility', 'visible');

        if (_self.options.rubberbandUpdate) {
          requestAnimationFrame(() => _self.options.rubberbandUpdate({
            x: mx,
            y: my,
            source: _self,
            getTrackElement: () => UIHelper.pickHStackedElement(
              _self.tracks.map(d => d.elm),
              mx,
            ),
            getTrackDatum: () => {
              const elm = UIHelper.pickHStackedElement(
                _self.tracks.map(d => d.elm),
                mx,
              );
              if (elm) return select(elm).datum();
              return null;
            },
          }));
        }
      });

      rbs.on('mouseout', () => {
        rb.style('visibility', 'hidden');
        if (_self.options.rubberbandExit) {
          requestAnimationFrame(() => _self.options.rubberbandExit({
            source: _self,
          }));
        }
      });
    }

    setAttrs(rbc.select('rect.tracker-rect'), {
      width: w,
      height: h,
    });

    setAttrs(rb, {
      x: 0,
      width: w,
      y: 0,
      class: 'rubber-band',
    }).style('visibility', 'hidden');
  }
}
