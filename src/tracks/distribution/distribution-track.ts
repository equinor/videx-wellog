import { ScaleLinear, scaleLinear } from 'd3-scale';
import CanvasTrack from '../canvas-track';
import {
  DistributionData,
  DistributionTrackOptions,
} from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';

interface DistributionPolygon {
  /** Color of the element. */
  color: string;
  /** Points array to store depths and values. */
  points: { depth: number, value: number }[];
}

const defaultOptions: DistributionTrackOptions = {
  discreteHeight: 10,
  interpolate: false,
};

/** Helper function for drawing filled rectangle vertically or horizontally. */
const fillRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, horizontal: boolean) => {
  ctx.fillRect(
    horizontal ? y : x,
    horizontal ? x : y,
    horizontal ? height : width,
    horizontal ? width : height,
  );
};

/** Track for visualising distribution of data. */
export class DistributionTrack extends CanvasTrack<DistributionTrackOptions> {
  xscale: ScaleLinear<number, number>;

  constructor(id: string | number, options: DistributionTrackOptions = {}) {
    super(id, {
      ...defaultOptions,
      ...options,
    });

    this.xscale = scaleLinear().domain([0, 1]);
  }

  /** Override of onMount from base class. */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const {
      options,
      loader,
    } = this;

    if (options.data) {
      const showLoader = options.showLoader ?? Boolean(loader);

      if (showLoader && typeof (options.data) === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  /** Override of onUpdate from base class. */
  onUpdate(event: OnUpdateEvent) {
    super.onUpdate(event);
    if (this.options.horizontal) {
      this.xscale.range([0, this.elm.clientHeight]);
    } else {
      this.xscale.range([0, this.elm.clientWidth]);
    }
    this.plot();
  }

  /** Override of onRescale from base class. */
  onRescale(event: OnRescaleEvent) {
    super.onRescale(event);
    this.plot();
  }

  private plot() {
    const {
      ctx,
      data,
      options,
    } = this;

    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Return early if 'data' is undefined or empty
    if (!data?.length) return;

    if (options.interpolate) {
      this.plotInterpolated();
    } else {
      this.plotDiscrete();
    }
  }

  private plotDiscrete() {
    const {
      ctx,
      scale: yscale,
      xscale,
      data,
      options,
    } = this;

    const {
      discreteHeight,
    } = options;

    // Get the current visible domain
    const [min, max] = yscale.domain();

    // Filter data based on the visible domain
    const visibleData = data.filter((d: DistributionData) => d && d.depth + discreteHeight >= min && d.depth - discreteHeight <= max);

    // Return if no visible data
    if (!visibleData?.length) return;

    // Transform depth
    const transformedData: DistributionData[] = visibleData.map((d: DistributionData) => ({
      depth: yscale(d.depth),
      composition: d.composition,
    }));

    transformedData.forEach(d => {
      let cumulativeWidth = 0;
      d.composition.forEach(({ key, value }) => {
        const width = xscale(value / 100); // Scale the width using xscale
        const color = options.components[key]?.color || 'black';
        ctx.fillStyle = color;
        fillRect(
          ctx,
          cumulativeWidth,
          d.depth - discreteHeight / 2,
          width,
          discreteHeight,
          options.horizontal,
        );
        cumulativeWidth += width;
      });
    });
  }

  private plotInterpolated() {
    const {
      ctx,
      scale: yscale,
      xscale,
      data,
      options,
    } = this;

    // Get the current visible domain
    const [min, max] = yscale.domain();

    // Filter data based on the visible domain and adjacent points
    const visibleData = data.filter((d: DistributionData, i: number) => {
      const prevDepth = data[i - 1]?.depth || -Infinity;
      const nextDepth = data[i + 1]?.depth || Infinity;
      return (d.depth >= min && d.depth <= max) || nextDepth > min || prevDepth < max;
    });

    // Return if no visible data
    if (!visibleData?.length) return;

    // Initiate distribution polygons
    const polygonData: { [key: string]: DistributionPolygon } = {};
    Object.entries(options.components).forEach(([key, component]) => {
      polygonData[key] = {
        color: component.color,
        points: [],
      };
    });

    // Populate depths and values for each component
    visibleData.forEach((d: DistributionData) => {
      const depth = yscale(d.depth);
      let cumulativeWidth = 0;
      Object.keys(polygonData).forEach(key => {
        const comp = d.composition.find(c => c.key === key);
        if (comp) {
          cumulativeWidth += xscale(comp.value / 100);
        }
        polygonData[key].points.push({
          depth,
          value: cumulativeWidth,
        });
      });
    });

    const createPolygon = (points: { depth: number, value: number }[]): [number, number][] => {
      const polygonPoints: [number, number][] = [];

      const addPoint = (x: number, y: number) => polygonPoints.push(options.horizontal ? [y, x] : [x, y]);

      // Add first point
      const firstPoint = points[0];
      addPoint(0, firstPoint.depth);

      // Add the points of the polygon
      points.forEach(({ depth, value }) => addPoint(value, depth));

      // Add last point
      const lastPoint = points[points.length - 1];
      addPoint(0, lastPoint.depth);

      return polygonPoints;
    };

    // Create and draw polygons
    // Drawn in reverse order to make sure the wider polygons are in the back.
    Object.values(polygonData).reverse().forEach((polygon, i) => {
      // Draw simple rect for background polygon
      if (i === 0) {
        const firstPoint = polygon.points[0];
        const lastPoint = polygon.points[polygon.points.length - 1];
        ctx.fillStyle = polygon.color;
        fillRect(
          ctx,
          0,
          firstPoint.depth,
          xscale(1),
          lastPoint.depth - firstPoint.depth,
          options.horizontal,
        );
        return;
      }

      const polygonPoints = createPolygon(polygon.points);
      ctx.fillStyle = polygon.color;
      ctx.beginPath();
      polygonPoints.forEach(([x, y], index) => {
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
    });
  }
}
