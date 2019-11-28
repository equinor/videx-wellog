import { ScaleHandlerTicks } from '../scale-handlers/interfaces';
import { Scale, Domain } from '../common/interfaces';

const ticksFactor = 60;
const minSize = 10;

/**
 * Util functions for d3 scales
 */
export default class ScaleHelper {
  /**
   * Get pixel ratio from scale
   */
  static getPixelRatio(scale: Scale) : number {
    const [dmin, dmax] = scale.domain();
    const [rmin, rmax] = scale.range();
    const deltaDomain = Math.abs(dmax - dmin);
    const deltaRange = Math.abs(rmax - rmin);
    return deltaRange / deltaDomain;
  }

  /**
   * Get domain ratio from scale
   */
  static getDomainRatio(scale: Scale) : number {
    const [dmin, dmax] = scale.domain();
    const [rmin, rmax] = scale.range();
    const deltaDomain = Math.abs(dmax - dmin);
    const deltaRange = Math.abs(rmax - rmin);
    return deltaDomain / deltaRange;
  }

  /**
   * Get the domain span of a scale in pixels
   */
  static getDomainSpan(scale: Scale, domain?: Domain) : number {
    const [d1, d2] = domain || scale.domain();

    const y1 = scale(d1);
    const y2 = scale(d2);

    return Math.max(0, Math.abs(y2 - y1));
  }

  /**
   * Get the range span of a scale in pixels
   */
  static getRangeSpan(scale: Scale) : number {
    const [r0, r1] = scale.range();
    return Math.abs(r1 - r0);
  }

  /**
   * Creates logarithmic major and minor ticks for a log scale
   */
  static createLogTicks(scale: Scale) : ScaleHandlerTicks {
    const [, xmax] = scale.domain();
    const guides = [];
    const ticks = {
      major: [],
      minor: [],
    };

    let curr = 1;
    while (curr < xmax) {
      guides.push(curr);
      curr *= 10;
    }

    const scaleTicks = scale.ticks().splice(1);

    scaleTicks.forEach((t) => {
      if (guides.includes(t)) {
        ticks.major.push(t);
      } else {
        ticks.minor.push(t);
      }
    });
    return ticks;
  }

  /**
   * Creates linear major and minor ticks
   */
  static createLinearTicks(scale: Scale, num: number = 10) : ScaleHandlerTicks {
    const hTicks = num;
    const hStep = ScaleHelper.getRangeSpan(scale) / hTicks;
    const center = hTicks / 2;
    const ticks = {
      major: [],
      minor: [],
    };

    for (let i = 1; i < hTicks; i += 1) {
      const x = i * hStep;
      if (center && (i % center) === 0) {
        ticks.major.push(scale.invert(x));
      } else {
        ticks.minor.push(scale.invert(x));
      }
    }
    return ticks;
  }

  /**
   * Internal. Creates minor ticks based around a value, number of steps and step size
   */
  static createMinorTicks(v: number, steps: number, stepSize: number) : number[] {
    const res = [];
    for (let i = 1; i < steps; i += 1) {
      const mv = v + (i * stepSize);
      res.push(mv);
    }
    return res;
  }

  /**
   * Create major and minor ticks from scale
   */
  static createTicks(scale: Scale) : ScaleHandlerTicks {
    const [dmin, dmax] = scale.domain();

    const height = ScaleHelper.getRangeSpan(scale);

    const major = [];
    const minor = [];

    if (height > 0) {
      const nTicks = Math.min(
        Math.ceil(height / ticksFactor),
        Math.floor(Math.abs(dmax - dmin)) * 2,
      );
      major.push(...scale.ticks(nTicks));

      const tickHeight = height / major.length;
      const majorSize = major.length > 1 ? major[1] - major[0] : (major[0] || 0);

      let numMinor = majorSize <= 1 ? majorSize * 10 : Math.min(10, majorSize);

      if (numMinor) {
        if (tickHeight < numMinor * minSize) {
          numMinor = Math.round(tickHeight / minSize / 5) * 5;
        }

        const minorSize = majorSize / numMinor;

        minor.push(...ScaleHelper.createMinorTicks(major[0] - majorSize, numMinor, minorSize));
        major.forEach(tick => {
          minor.push(...ScaleHelper.createMinorTicks(tick, numMinor, minorSize));
        });
      }
    }

    return {
      major,
      minor: minor.filter(t => t >= dmin && t <= dmax),
    };
  }
}
