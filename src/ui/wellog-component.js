import {
  select,
  mouse,
  event,
  zoom,
  zoomIdentity,
  zoomTransform,
} from 'd3';

import BasicScaleHandler from '../scale-handlers/basic-scale-handler';

const defaultOptions = {
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

const titleBarBaseSize = 18;
const legendBaseSize = 25;
const titleFontSizeFactor = 0.7;
const uiScaleFactor = 800;
const wheelPanFactor = 50;

const transitionDuration = 200;
const debounceInterval = 20;

/**
 * Updates the rubber band controller
 * @param {DOMElement} rbc rubber band container
 * @param {number} w width
 * @param {number} h height
 */
function updateRubberBand(rbc, w, h) {
  if (w <= 0 || h <= 0) return;

  let rb = rbc.select('rect.rubber-band');
  if (rb.empty()) {
    rb = rbc.append('rect').attr('class', 'rubber-band');
    const rbs = rbc.append('rect').attrs({
      class: 'tracker-rect',
      x: 0,
      y: 0,
      width: w,
      height: h,
      stroke: 'none',
      fill: 'transparent',
    });

    rbs.on('mousemove', function rbmm() {
      const mousePos = mouse(this);
      rb.attrs({
        y: mousePos[1] - 1,
      }).style('visibility', 'visible');
    });

    rbs.on('mouseout', () => {
      rb.style('visibility', 'hidden');
    });
  }
  rbc.select('rect.tracker-rect').attrs({
    width: w,
    height: h,
  });

  rb.attrs({
    x: 0,
    width: w,
    y: 0,
    height: 1,
    class: 'rubber-band',
  }).style('visibility', 'hidden');
}

/**
 * A container component for wellog tracks, supporting track titles,
 * legends, adding/removing tracks, resizing, scaleHandlers, event emitting
 * zooming, panning and rubber band tracing.
 */
export default class WellogComponent {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.tracks = [];
    this.root = null;
    this.zoom = null;
    this.innerWidth = 0;
    this.innerHeight = 0;
    this.legendRows = 0;
    this.legends = {};

    this._debounces = {};

    this.scaleHandler = options.scaleHandler || new BasicScaleHandler();

    this.init = this.init.bind(this);
    this.rescale = this.rescale.bind(this);
    this.adjustZoomTransform = this.adjustZoomTransform.bind(this);
    this.zoomed = this.zoomed.bind(this);
    this.notify = this.notify.bind(this);
    this.debounce = this.debounce.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.adjustToSize = this.adjustToSize.bind(this);
    this.updateTracks = this.updateTracks.bind(this);
    this.postUpdateTracks = this.postUpdateTracks.bind(this);
    this.updateLegendRows = this.updateLegendRows.bind(this);
    this.updateLegend = this.updateLegend.bind(this);
    this.processLegendConfig = this.processLegendConfig.bind(this);
    this._trackExit = this._trackExit.bind(this);
    this._trackEnter = this._trackEnter.bind(this);
    this._trackUpdate = this._trackUpdate.bind(this);

    this.getPanExcess = () => 0;
  }

  /**
   * Initializes the component and attach itself to the provided DOM element.
   * @param {DOMElement} elm DOM element to attach to
   */
  init(elm) {
    const { margin } = this.options;

    this.zoom = zoom()
      .scaleExtent([1, 256])
      .on('zoom', this.zoomed);

    const root = select(elm);

    root.styles({
      position: 'relative',
    });

    const main = root
      .append('div')
      .styles({
        margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
      })
      .attr('class', 'main-group');

    main.append('div').attr('class', 'tracks-group');

    const overlay = main.append('svg').attrs({
      class: 'overlay',
    });

    overlay.call(this.zoom);

    const wheelZoomFunc = overlay.on('wheel.zoom').bind(overlay.node());
    overlay.on('wheel.zoom', () => {
      if (event.ctrlKey || event.shiftKey) {
        const scaleMod = zoomTransform(overlay.node()).k / 3;
        this.zoom.translateBy(overlay, 0, event.wheelDeltaY / wheelPanFactor / scaleMod);
      } else {
        wheelZoomFunc();
      }
      event.preventDefault();
    });

    this.currentTransform = () => zoomTransform(overlay.node());
    this.root = root;

    this.adjustToSize();
    this._initialized = true;
  }

  /**
   * Recalculates transform based on new container size
   */
  adjustZoomTransform() {
    const overlay = this.root.select('.overlay');
    const [d1, d2] = this.scaleHandler.baseDomain;
    if (d1 === d2) return;

    const y1 = this.scale(d1);
    const y2 = this.scale(d2);

    const [r1, r2] = this.scale.range();
    const height = r2 - r1;
    const transform = zoomIdentity.translate(0, y1).scale((y2 - y1) / height);
    this.zoom.transform(overlay, transform);
  }

  /**
   * Event handler for pan/zoom
   */
  zoomed() {
    const { transform } = event;

    this.scaleHandler.rescale(transform);

    this.zoom.translateExtent([
      [0, 0],
      [0, this._plotHeight + (this.getPanExcess() / this.currentTransform().k)],
    ]);

    this.rescale();
  }

  /**
   * Notify all clients (tracks) on changes to domain/transform
   */
  rescale() {
    this.notify('onRescale', {
      scale: this.scaleHandler.dataScale,
      transform: this.currentTransform(),
    });
  }

  /**
   * Processes track legend config object, creating the necessary DOM elements and
   * hooking up callback functions etc.
   * @param {Track} track
   * @param {DOMElement} elm
   */
  processLegendConfig(track, elm) {
    const { legendConfig } = track.options;

    if (!legendConfig) return;

    let legendElement = elm;
    if (legendConfig.elementType === 'svg') {
      legendElement = select(elm).append('svg')
        .attrs({
          width: '100%',
          height: '100%',
        })
        .styles({
          flex: '1 1 auto',
        })
        .node();
    }

    if (legendConfig.onInit) {
      legendConfig.onInit(
        legendElement,
        track,
        () => this.updateLegend(track.id),
      );
    }
    this.legends[track.id] = {
      elm: legendElement,
      track,
    };
  }

  /**
   * Determines the required number of rows in the legend section.
   */
  updateLegendRows() {
    const {
      tracks,
    } = this;

    const maxRows = tracks.reduce((rows, track) => {
      if (track.options.legendConfig) {
        const tr = +track.options.legendConfig.getLegendRows(track);
        if (Number.isFinite(tr)) return Math.max(rows, tr);
      }
      return rows;
    }, 0);

    if (maxRows !== this.legendRows) {
      this.legendRows = maxRows;
      this.adjustToSize(true);
    }
  }

  /**
   * Updates the legend for a specific track
   * @param {string} id Track id
   */
  updateLegend(id) {
    if (this.legends[id]) {
      const {
        legends,
        _uiScale: uiScale,
        _legendHeight: legendHeight,
      } = this;

      const { elm, track } = legends[id];
      const { legendConfig } = track.options;

      const rows = legendConfig.getLegendRows(track) || 0;

      const height = rows * legendBaseSize * uiScale;
      const bounds = {
        height,
        top: legendHeight - height,
        width: elm.clientWidth,
      };

      if (legendConfig.onUpdate) {
        legendConfig.onUpdate(elm, bounds, track);
      }
    }
  }

  /**
   * Adds a track to the wellog component
   * @param {Track} track track to be added
   */
  addTrack(track) {
    this.tracks.push(track);
    this.tracks.sort((a, b) => a.order - b.order);

    if (
      track.options.legendConfig &&
      track.options.legendConfig.getLegendRows(track) > this.legendRows
    ) {
      this.updateLegendRows();
    }

    if (this._initialized) {
      this.debounce('updateTracks');
    }
  }

  /**
   * Removes a track from the wellog component
   * @param {Track} track track to be removed
   */
  removeTrack(track) {
    const idx = this.tracks.findIndex(d => d.id === track.id);
    if (idx >= 0) {
      if (this.legends[track.id]) {
        delete this.legends[track.id];
      }
      this.tracks.splice(idx, 1);
      if (
        track.options.legendConfig &&
        track.options.legendConfig.getLegendRows(track) >= this.legendRows
      ) {
        this.updateLegendRows();
      }
      if (this._initialized) {
        this.debounce('updateTracks');
      }
    }
  }

  /**
   * Rescale according to new container size
   * @param {boolean} [force] Set to true in order to force update even if size has not changed
   */
  adjustToSize(force = false) {
    const {
      root,
      options: {
        margin,
      },
      innerWidth: oldInnerWidth,
      innerHeight: oldInnerHeight,
      _titleHeight: oldTitleHeight,
      _legendHeight: oldLegendHeight,
      _plotHeight: oldPlotHeight,
    } = this;
    const { width, height } = root.node().getBoundingClientRect();

    this.innerWidth = Math.max(0, width - margin.left - margin.right);
    this.innerHeight = Math.max(0, height - margin.top - margin.bottom);

    // exit early if nothing has changed
    if (!force && oldInnerWidth === this.innerWidth && oldInnerHeight === this.innerHeight) {
      return;
    }

    // recalculate sizes
    this._uiScale = Math.max(Math.min(1, this.innerWidth / uiScaleFactor), 0.6);
    this._titleHeight = titleBarBaseSize * this._uiScale;
    this._legendHeight = this.legendRows * legendBaseSize * this._uiScale;
    this._plotHeight = this.innerHeight - this._titleHeight - this._legendHeight;
    this._titleFontSize = this._titleHeight * titleFontSizeFactor;

    if (this._plotHeight !== oldPlotHeight) {
      this.scale.range([0, this._plotHeight]);
      this.adjustZoomTransform();
      this.rescale();
    }

    // see if tracks need to be updated in any way
    if (this._titleHeight !== oldTitleHeight || this._legendHeight !== oldLegendHeight) {
      this.debounce('updateTracks');
    } else if (this.innerWidth !== oldInnerWidth) {
      this.adjustTrackTitles();
    }

    // resize svg overlay
    if (this.innerWidth !== oldInnerWidth || this._plotHeight !== oldPlotHeight) {
      this.debounce('updateTracks');
      const overlay = root.select('svg.overlay').styles({
        top: `${this.innerHeight - this._plotHeight + 1}px`,
      }).attrs({
        width: this.innerWidth,
        height: this._plotHeight,
      });

      updateRubberBand(overlay, this.innerWidth, this._plotHeight);
    }
  }

  /**
   * Update track-elements based on current registered track instances
   */
  updateTracks() {
    const {
      root,
      tracks,
      debounce,
      _trackEnter: trackEnter,
      _trackUpdate: trackUpdate,
      _trackExit: trackExit,
    } = this;

    const selection = root.select('.tracks-group').selectAll('.track').data(tracks, t => t.id);

    selection.interrupt();

    const exit = selection.exit();
    const enter = selection.enter();

    exit.call(trackExit);
    enter.call(trackEnter);

    selection.call(trackUpdate);

    if (exit.empty() && enter.empty()) {
      debounce('postUpdateTracks');
    }
  }

  /**
   * Adjust track titles according to available space. Uses abbrievation
   * istead of full label if not enough space.
   */
  adjustTrackTitles() {
    this.root.selectAll('.track-title')
      .text(d => d.options.label)
      .each(function updateTitle(d) {
        if (this.clientWidth < this.scrollWidth) {
          select(this).text(d.options.abbr);
        }
      });
  }

  /**
   * Trigger onUpdate event after tracks has been altered in size
   */
  postUpdateTracks() {
    const { root, scaleHandler, updateLegend } = this;

    root.selectAll('.track').each(function updateTrack(d) {
      if (d.onUpdate) {
        const elm = this.querySelector('.track-plot');
        window.requestAnimationFrame(() => {
          d.onUpdate({
            elm,
            scale: scaleHandler.dataScale,
          });
          if (d.options.legendConfig) {
            updateLegend(d.id);
          }
        });
      }
    });

    this.adjustTrackTitles();
  }

  /**
   * Remove DOM-elements belonging to removed tracks
   * @param {d3.Selection} selection
   */
  _trackExit(selection) {
    selection.each((d) => d.onUnmount && d.onUnmount());

    selection
      .transition()
      .duration(transitionDuration)
      .style('flex', '0 0 0%')
      .on('end', () => this.debounce('postUpdateTracks'))
      .remove();
  }

  /**
   * Add DOM-elements for new tracks
   * @param {d3.Selection} selection
   */
  _trackEnter(selection) {
    const {
      scaleHandler,
      processLegendConfig,
      _titleHeight: titleHeight,
      _legendHeight: legendHeight,
      _titleFontSize: fontSize,
    } = this;

    const newtracks = selection.append('div').attr('class', 'track').styles({
      flex: '0 0 0%',
      'max-width': d => (d.options.maxWidth ? `${d.options.maxWidth}px` : null),
    });

    newtracks.append('div')
      .attrs(d => ({
        class: 'track-title',
        title: d.options.label,
      }))
      .styles({
        height: `${titleHeight}px`,
        'font-size': `${fontSize}px`,
      });

    newtracks.append('div')
      .classed('track-legend', true)
      .styles({
        height: `${legendHeight}px`,
      });

    newtracks.append('div').attr('class', 'track-plot');

    const loader = newtracks.append('div').attrs({
      class: 'loader hidden',
    });

    for (let i = 0; i < 3; i++) {
      loader.append('div').classed('loading-dots', true);
    }

    newtracks.each(function addTrackCallback(d) {
      d.loader = this.querySelector('.loader');
      const ev = {
        elm: this.querySelector('.track-plot'),
        scale: scaleHandler.dataScale,
        scaleHandler,
      };

      if (d.onMount) d.onMount(ev);
      if (d.options.legendConfig) processLegendConfig(d, this.querySelector('.track-legend'));
    });

    newtracks
      .transition()
      .duration(transitionDuration)
      .style('flex', d => `${d.options.width}`)
      .on('end', () => this.debounce('postUpdateTracks'));
  }

  /**
   * Update DOM-elements for existing tracks
   * @param {d3.Selection} selection
   */
  _trackUpdate(selection) {
    const {
      _titleHeight: titleHeight,
      _legendHeight: legendHeight,
      _titleFontSize: fontSize,
    } = this;

    selection.style('flex', d => `${d.options.width}`);
    selection.select('.track-title').styles({
      height: `${titleHeight}px`,
      'font-size': `${fontSize}px`,
    });

    selection.select('.track-legend').styles({
      height: `${legendHeight}px`,
    });
  }

  /**
   * Triggers event according to type and passes arguments to clients (tracks)
   * @param {string} type notification type (event type)
   * @param  {...any} args arguments to pass
   */
  notify(type, ...args) {
    // console.log('>> ' + type, ...args);
    this.tracks.forEach(track => {
      const func = track[type] || track.options[type];

      if (func && typeof (func) === 'function') {
        window.requestAnimationFrame(() => func(...args, track));
      }
    });
  }

  /**
   * Throtteling of function calls
   * @param {string} funcName name of function to be called
   * @param  {...any} args arguments to be passed
   */
  debounce(funcName, ...args) {
    if (this._debounces[funcName]) {
      clearTimeout(this._debounces[funcName]);
    }
    const f = this[funcName];
    this._debounces[funcName] = setTimeout(() =>
      f(...args), debounceInterval);
  }

  /**
   * Getter for (base) domain
   * @returns {number[]}
   */
  get domain() {
    return this.scale.domain();
  }

  /**
   * Setter from (base) domain
   * @param {number[]} value
   */
  set domain(value) {
    if (value && Array.isArray(value)) {
      this.scaleHandler.baseDomain = value;
      this.rescale();
    }
  }

  /**
   * Getter for the wellog's internal scale
   * @returns {d3.scale}
   */
  get scale() {
    return this.scaleHandler.internalScale;
  }
}
