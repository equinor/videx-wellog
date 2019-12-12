import { mean, extent } from 'd3';
import { PlotData, DifferentialPlotData } from '../plots/interfaces';
import { Scale, Domain, Tuplet } from '../common/interfaces';

export type ReducerFunction = (data: PlotData) => Tuplet<number>[];

/**
 * Various utility functions for transforming and processing
 * data sets.
 */
export default class DataHelper {
  /**
 * Reduce multiple points to the its average values.
 */
  static avg(segment: PlotData) : Tuplet<number>[] {
    if (segment.length <= 2) return segment;
    const avgV = mean(segment, d => d[1]);
    const avgD = mean(segment, d => d[0]);

    return [[avgD, avgV]];
  }

  static minmax(segment: PlotData) : Tuplet<number>[] {
    if (segment.length <= 2) return segment;
    const ext = extent(segment, d => d[1]);
    return [
      [segment[0][0], ext[0]],
      [segment[segment.length - 1][0], ext[1]],
    ];
  }

  /**
  * Test if the data is within the scale's domain
  */
  static isWithinBounds(scale: Scale, datapoints: PlotData) : boolean {
    if (!datapoints || datapoints.length < 1) return false;

    const [min, max] = scale.domain();
    const first = datapoints[0];
    const last = datapoints[datapoints.length - 1];

    if (first[0] > max || last[0] < min) return false;

    return true;
  }

  /**
  * Remove successive entries of NULL values, leaving only the first
  * NULL value. Required by the resample function.
  */
  static trimUndefinedValues(datapoints: PlotData) : PlotData {
    let prev = 0;
    return datapoints.filter(pt => {
      let include = true;
      if (pt[1] === null && prev === null) {
        include = false;
      }
      prev = pt[1];
      return include;
    });
  }

  /**
  * Cut data points that are outside the current visible domain.
  * An excess will ensure that panning is smooth
  */
  static filterData(datapoints: PlotData, domain: Domain, excessFactor: number = 0.5) : PlotData {
    const [d0, d1] = domain;
    const span = d1 - d0;
    const excess = excessFactor * span;
    const dmin = d0 - excess;
    const dmax = d1 + excess;

    return datapoints.filter((pt, i) => {
      const within = pt[0] >= dmin && pt[0] <= dmax;
      if (within) return true;

      const prevLessThanMax = (i - 1 >= 0 && datapoints[i - 1][0] < dmax);
      const nextGreaterThanMin = (i + 1 < datapoints.length && datapoints[i + 1][0] > dmin);
      return (prevLessThanMax && nextGreaterThanMin);
    });
  }

  /**
  * Downsample large data series to reduce detail when number of points are
  * greater than the number of pixels to render it to
  */
  static resample(datapoints: PlotData, ratio: number, reducer: ReducerFunction = DataHelper.avg) : PlotData {
    if (ratio <= 2 || datapoints.length < 100) return datapoints;

    ratio = Math.floor(ratio);

    const lastIndex = datapoints.length - 1;
    const first = datapoints[0];
    const last = datapoints[lastIndex];
    let l = 1;
    const reduced = [];
    let _safe = 0;

    while (l < lastIndex) {
      let r = Math.min(l + ratio, lastIndex);
      const segment = datapoints.slice(l, r);
      // check if segment needs to be split if containing an undefined value
      const undefinedIdx = segment.findIndex(d => !Number.isFinite(d[1]));

      if (undefinedIdx > -1) {
        r = l + 1;
        const undefinedEntry = segment[undefinedIdx];
        const trailingEntry = segment[undefinedIdx + 1];

        segment.splice(undefinedIdx);

        if (undefinedIdx > 0) {
          segment.pop();
          r++;
        }

        if (segment.length > 0) {
          reduced.push(...reducer(segment));
          r += segment.length;
        }
        reduced.push(undefinedEntry);

        if (trailingEntry) {
          reduced.push(trailingEntry);
          r++;
        }
      } else if (segment.length > 0) {
        reduced.push(...reducer(segment));
      }
      l = r;

      // ael
      _safe++;
      if (_safe > 1000000) {
        throw Error('Infinite loop terminated!');
      }
    }
    return [first, ...reduced, last];
  }

  static resample2(datapoints: PlotData, scale: Scale, reducer: ReducerFunction = DataHelper.minmax) : PlotData {
    if (datapoints.length < 10) return datapoints;
    const lastIndex = datapoints.length - 1;
    const first = datapoints[0];
    const last = datapoints[lastIndex];
    const reduced = [];
    let l = datapoints.findIndex(d => Number.isFinite(d[1]));
    if (l === -1) {
      return [first, last];
    }
    if (l > 1) {
      reduced.push(datapoints[l - 1]);
    }
    let r = l + 1;
    let y = scale(datapoints[l][0]);
    let target = scale.invert(++y);
    while (r < lastIndex) {
      const rp = datapoints[r];
      const isdef = Number.isFinite(rp[1]);
      if (!isdef || rp[0] >= target) {
        const segment = r - l > 0 ? datapoints.slice(l, r) : [];
        // abort if the segment size becomes too small
        if (segment.length <= 4 && isdef) {
          return datapoints;
        }
        if (segment.length === 1) {
          reduced.push(segment[0]);
        } else if (segment.length !== 0) {
          reduced.push(...reducer(segment));
        }
        if (!isdef) {
          r++;
        }
        l = r;
        target = scale.invert(++y);
      } else {
        r++;
      }
    }
    return [first, ...reduced, last];
  }

  /**
  * Trim two data series so that it can be correlated.
  * Used in differential plot.
  */
  static mergeDataSeries(arr1: PlotData, arr2: PlotData) : DifferentialPlotData {
    const res : DifferentialPlotData = [];
    let n = 0;

    if (arr1.length > 0 && arr2.length > 0) {
      let md = Math.min(arr1[0][0], arr2[0][0]);
      let i = 0;
      let j = 0;

      // fill in top if series are not starting at the same depth
      while (md > arr1[0][0]) {
        md = arr2[j][0];
        res[n++] = [md, null, arr2[j][1]];
        j++;
      }
      while (md > arr2[0][0]) {
        md = arr1[i][0];
        res[n++] = [md, arr1[i][1], null];
        i++;
      }

      // correlate values using arr1 as master, averaging arr2
      while (i < arr1.length && j < arr2.length) {
        md = arr1[i][0];
        let rv = 0;
        let rn = 0;
        while (j < arr2.length && arr2[j][0] <= md) {
          if (arr2[j][1] === null) {
            res[n++] = [arr2[j++][0], arr1[i][1], null];
            break;
          }
          rv += arr2[j][1];
          rn++;
          j++;
        }
        res[n++] = [md, arr1[i][1], rn > 0 ? rv / rn : null];
        i++;
      }

      // fill in any trailing points from either arrays
      while (i < arr1.length) {
        res[n++] = [arr1[i][0], arr1[i][1], null];
        i++;
      }

      while (j < arr2.length) {
        res[n++] = [arr2[j][0], null, arr2[j][1]];
        j++;
      }

      return res;
    }
    if (arr1.length > 0) {
      return arr1.map(d => [d[0], d[1], null]);
    }
    if (arr2.length > 0) {
      return arr2.map(d => [d[0], null, d[1]]);
    }
    return [];
  }

  /**
   * In a data set of two values, return the second element
   * of the item where the first item is closest to the query
   * value. The data set is considered to be contineous rather
   * than discrete.
   */
  static queryContinuousData(queryVal: number, data: PlotData) : number | null {
    if (queryVal < data[0][0] || queryVal > data[data.length - 1][0]) return null;
    let idx = data.findIndex(d => queryVal <= d[0]);
    if (idx > 0) {
      const qFound = data[idx][0];
      const qBefore = data[idx - 1][0];
      if (queryVal - qBefore < qFound - queryVal) {
        idx -= 1;
      }
    }
    if (idx !== -1) {
      return data[idx][1];
    }
    return null;
  }

  /**
   * In a data set of two values, return the second element
   * of the item where the first item is closest to the query
   * value. The data set is considered to be discrete.
   */
  static queryPointData(queryVal: number, data: PlotData, threshold: number = 0) : number | null {
    const bestMatch = data
      .filter(d => queryVal - threshold <= d[0] && d[0] <= queryVal + threshold)
      .reduce((match, d) => {
        const rank = Math.abs(queryVal - d[0]);
        if (match.rank === null || rank < match.rank) {
          return { data: d, rank };
        }
        return match;
      }, { data: null, rank: null }).data;

    if (bestMatch !== null) {
      return bestMatch[1];
    }
    return null;
  }

  /**
   * In a data set of two values, return the second element
   * of the item where the first item is closest to the query
   * value. The data set is considered to be organized such that
   * an item is the end of the previous item and the start of the
   * next (zones).
   */
  static queryZoneData(queryVal:number, data:PlotData) : number|null {
    const index = data.findIndex((d, i, arr) => (
      i < arr.length - 1 && d[1] !== null && d[0] <= queryVal && arr[i + 1][0] > queryVal
    ));

    return index > -1 ? data[index][1] : null;
  }
}
