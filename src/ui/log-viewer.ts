import { zoom, zoomTransform } from 'd3';
import LogController from './log-controller';
import createOverlay from './overlay';
import { LogControllerOptions, Overlay } from './interfaces';

const wheelPanFactor = 50;

export default class LogViewer extends LogController {
  public overlay: Overlay;

  constructor(options: LogControllerOptions = {}) {
    super(options);
  }

  /**
   * Simple creator function for minimal setup
   * @param showTitles optional flag to show titles or not
   */
  static basic(showTitles: boolean = true) : LogViewer {
    return new LogViewer({
      showTitles,
      showLegend: false,
    });
  }

  public onMount(element: HTMLElement) : void {
    super.setup(element);

    const overlay = createOverlay(this, this.container);

    this.zoom = zoom()
      .scaleExtent([1, this.options.maxZoom || 256])
      .on('zoom', this.zoomed);

    overlay.elm.call(this.zoom);

    const wheelZoomFunc = overlay.elm.on('wheel.zoom').bind(overlay.elm.node());
    const dblClickZoomFunc = overlay.elm.on('dblclick.zoom').bind(overlay.elm.node());
    overlay.elm.on('dblclick.zoom', event => {
      if (this.overlay.enabled) {
        dblClickZoomFunc(event);
      }
    });
    overlay.elm.on('wheel.zoom', event => {
      if (this.overlay.enabled) {
        if (event.ctrlKey || event.shiftKey) {
          const scaleMod = zoomTransform(overlay.elm.node()).k / 3;
          const transitionAmount = event.wheelDeltaY / wheelPanFactor / scaleMod;
          if (this.options.horizontal) {
            this.zoom.translateBy(overlay.elm, transitionAmount, 0);
          } else {
            this.zoom.translateBy(overlay.elm, 0, transitionAmount);
          }
        } else {
          wheelZoomFunc(event);
        }
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
  protected zoomed(event) : void {
    const { transform, sourceEvent } = event;

    // abort if event was triggered by user interaction when overlay is disabled
    if (!this.overlay.enabled && sourceEvent !== null) {
      return;
    }

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
