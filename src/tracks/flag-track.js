import CanvasTrack from './canvas-track';
import DataHelper from '../utils/data-helper';

/**
 * trim and reduce data according to scale
 * @param {d3.scale} scale y-scale
 * @param {number[][]} data Flag data
 */
function trimData(scale, data) {
  if (data && DataHelper.isWithinBounds(scale, data)) {
    let startPoint = data[0][0];
    return data.reduce((rect, item, index, array) => {
      if (!item[1]) {
        startPoint = item[0];
        return rect;
      }

      if (index + 1 < array.length && array[index + 1][1]) {
        return rect;
      }

      rect.push({
        yFrom: scale(startPoint),
        yTo: scale(item[0]),
      });
      return rect;
    }, []);
  }
  return [];
}

/**
 * Track for visualising flag (on/off) type of data.
 */
export default class FlagTrack extends CanvasTrack {
  /**
   * Override of onMount from base class
   * @param {object} event
   */
  onMount(event) {
    super.onMount(event);

    const {
      options,
    } = this;

    this.color = options.color || 'gray';

    if (options.data) {
      this.isLoading = true;
      options.data().then(data => {
        this.data = data;
        this.isLoading = false;
        // this.legendUpdate && this.legendUpdate();
      });
    }
  }

  /**
   * Override of onRescale from base class
   * @param {object} event
   */
  onRescale(event) {
    super.onRescale(event);
    this.plot();
  }

  /**
   * Override of onUpdate from base class
   * @param {object} event
   */
  onUpdate(event) {
    super.onUpdate(event);
    this.plot();
  }

  /**
   * Override plot from base class. Plots track data.
   */
  plot() {
    const {
      ctx,
      scale: yscale,
      data,
      color,
    } = this;

    if (!ctx) return;

    const { dataPoints = [] } = data || [];

    const rects = trimData(yscale, dataPoints);

    const w = ctx.canvas.width;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.fillStyle = color;
    rects.forEach(r => {
      ctx.fillRect(0, r.yFrom, w, r.yTo - r.yFrom);
    });
    ctx.restore();
  }
}
