import { select } from 'd3-selection';
import CanvasTrack from '../canvas-track';
import { DotPlot, setStyles } from '../..';
import { CorePhotosTrackOptions } from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';
import { D3Selection } from '../../common/interfaces';


export default class CorePhotosTrack extends CanvasTrack<CorePhotosTrackOptions> {
  container: D3Selection;
  dotPlot: DotPlot;

  
  constructor(id: string | number, options: CorePhotosTrackOptions = {}) {
    super(id, {
      ...options,
    });
  }

  /**
   * Override of onMount from base class
   * @param {object} event
   */
  onMount(event: OnMountEvent) : void {
    super.onMount(event);

    const {
      options,
      ctx,
    } = this;

    this.container = select(event.elm).append('div').style('position', 'relative');

    // Force the dot plot above the image elements
    ctx.canvas.style.zIndex = '1';

    this.dotPlot = new DotPlot('Plugs', {
      scale: 'linear',
      horizontal: this.options.horizontal,
    });

    if (options.data) {
      if (typeof (options.data) === 'function') {
        this.loadData(options.data);
      } else {
        this.data = options.data;
      }
    }
  }

  /**
   * Override of onRescale from base class
   * @param {object} event
   */
  onRescale(event: OnRescaleEvent) : void {
    super.onRescale(event);
    this.plot();
  }

  /**
   * Override of onUpdate from base class
   * @param {object} event
   */
  onUpdate(event: OnUpdateEvent) : void {
    const {
      container,
      elm,
    } = this;
    super.onUpdate(event);
    if (container) {
      setStyles(container, {
        width: `${elm.clientWidth}px`,
        height: `${elm.clientHeight}px`,
      });
    }
    this.plot();
  }

  onDataLoaded() : void {
    const {
      data,
    } = this;
    if (!data) return;

    this.dotPlot.setData(data.plugs.map(p => [p.coreDepth, 0]));
    this.plot();
  }

  plotImages() {
    const {
      scale,
      elm,
      container,
    } = this;

    // selects all corephotos
    const imageSelection = this.container.selectAll('img').data((this.data || {}).images || []);


    if( this.options.horizontal ) {
      const h = Math.round(elm.clientHeight);
      let span = imageSelection.enter().append('img') 
      .attr('src', d => d.url)
        // .style('transform', 'rotate(90deg)')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('left', d => `${scale(d.from)}px`)
        .attr('width', d => scale(d.to) - scale(d.from))
        .attr('height', h);
    } else {
      const w = Math.round(elm.clientWidth);
      imageSelection
      .style('top', d => `${scale(d.from)}px`)
      .attr('width', w)
      .attr('height', d => scale(d.to) - scale(d.from))
      .attr('src', d => d.url);

    imageSelection.enter().append('img')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .attr('src', d => d.url)
      .style('top', d => `${scale(d.from)}px`)
      .attr('width', w)
      .attr('height', d => scale(d.to) - scale(d.from));
    }

    imageSelection.exit().remove();
  }

  /**
   * Override plot from base class. Plots track data.
   */
  plot() : void {
    const {
      scale,
      elm,
      ctx,
    } = this;

    if (!ctx || !scale) return;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    this.plotImages();

    this.dotPlot
      .setRange([elm.clientWidth / 2, elm.clientHeight])
      .setOption('color', 'yellow')
      .setOption('radius', 4)
      .plot(ctx, scale);
  }
}