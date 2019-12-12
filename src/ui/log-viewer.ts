import { zoom, event, zoomTransform } from 'd3';
import TrackGroup from './track-group';
import createOverlay from './overlay';
import { TrackGroupOptions, Overlay } from './interfaces';

const wheelPanFactor = 50;

export default class LogViewer extends TrackGroup {
  public overlay: Overlay;

  constructor(options: TrackGroupOptions = {}) {
    super(options);
  }

  public onMount(element: HTMLElement) : void {
    super.setup(element);

    const overlay = createOverlay(this, this.container);

    this.zoom = zoom()
      .scaleExtent([1, this.options.maxZoom || 256])
      .on('zoom', this.zoomed);

    overlay.elm.call(this.zoom);

    const wheelZoomFunc = overlay.elm.on('wheel.zoom').bind(overlay.elm.node());
    overlay.elm.on('wheel.zoom', () => {
      if (event.ctrlKey || event.shiftKey) {
        const scaleMod = zoomTransform(overlay.elm.node()).k / 3;
        const transitionAmount = event.wheelDeltaY / wheelPanFactor / scaleMod;
        if (this.options.horizontal) {
          this.zoom.translateBy(overlay.elm, transitionAmount, 0);
        } else {
          this.zoom.translateBy(overlay.elm, 0, transitionAmount);
        }
      } else {
        wheelZoomFunc();
      }
      event.preventDefault();
    });
    this.overlay = overlay;
    this.adjustToSize();
    this._initialized = true;
  }

  public adjustToSize(force: boolean = false) : void {
    super.adjustToSize(force);

    const {
      container,
      innerBounds,
      width,
      height,
      overlay,
      _trackHeight,
      options: {
        horizontal,
        onResize,
      },
    } = this;

    const overlaySize = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    };
    if (horizontal) {
      overlaySize.left = innerBounds.length - _trackHeight + 1;
      overlaySize.width = _trackHeight;
      overlaySize.height = innerBounds.span;
    } else {
      overlaySize.top = innerBounds.length - _trackHeight + 1;
      overlaySize.height = _trackHeight;
      overlaySize.width = innerBounds.span;
    }
    overlay.elm.dispatch('resize', { detail: overlaySize });

    if (onResize) {
      onResize({
        elm: container.node(),
        width,
        height,
        trackHeight: _trackHeight,
        source: this,
      });
    }
  }

  /**
   * Notify all clients (tracks) on changes to domain/transform
   * @param domain optional domain to scale to
   * @param duration optional duration of transition effect, 0 = no transition
   */
  public rescale() : void {
    super.rescale();
    const transform = zoomTransform(this.zoomHandler.node());
    this.overlay.elm.dispatch('rescale', { detail: { transform } });
  }

  /**
   * Event handler for pan/zoom
   */
  protected zoomed() : void {
    const { transform } = event;
    const { k } = transform;
    const panExcess = this.options.panExcess || [0, 0];

    if (this.options.horizontal) {
      this.scaleHandler.rescale(transform, 'x');
      this.zoom.translateExtent([
        [-Math.abs(panExcess[0] / k), 0],
        [this._trackHeight + Math.abs(panExcess[1] / k), 0],
      ]);
    } else {
      this.scaleHandler.rescale(transform, 'y');
      this.zoom.translateExtent([
        [0, -Math.abs(panExcess[0] / k)],
        [0, this._trackHeight + Math.abs(panExcess[1] / k)],
      ]);
    }
    this.rescale();
  }

  get zoomHandler() {
    return this.overlay.elm;
  }
}
