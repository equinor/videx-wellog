import { PlotData, DifferentialPlotData } from '../plots/interfaces';
import { Scale, Domain, Tuplet } from '../common/interfaces';
import ScaleHelper from './scale-helper';

export type ReducerFunction = (data: PlotData) => Tuplet<number>[];

/**
 * Various utility functions for transforming and processing
 * data sets.
 */
export default class DataHelper {
  /**
 * Reduce multiple points to the its average values.
 */
  static mean(segment: PlotData) : Tuplet<number>[] {
    if (segment.length <= 2) return segment;
    let avgV = 0;
    let avgD = 0;
    for (let i = 0; i < segment.length; i++) {
      avgD += segment[i][0];
      avgV += segment[i][1];
    }
    return [[avgD / segment.length, avgV / segment.length]];
  }

  static minmax(segment: PlotData) : Tuplet<number>[] {
    if (segment.length <= 2) return segment;
    let min = segment[0][1];
    let max = -Infinity;
    let minLast = false;

    for (let i = 0; i < segment.length; i++) {
      if (segment[i][1] > max) {
        max = segment[i][1];
        minLast = false;
      } else if (segment[i][1] < min) {
        min = segment[i][1];
        minLast = true;
      }
    }
    return [
      [segment[0][0], minLast ? max : min],
      [segment[segment.length - 1][0], minLast ? min : max],
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
  static filterData(datapoints: PlotData, domain: Domain, overlapFactor: number = 0.5) : PlotData {
    const [d0, d1] = domain;
    const span = d1 - d0;
    const overlap = overlapFactor * span;
    const dmin = d0 - overlap;
    const dmax = d1 + overlap;

    return datapoints.filter((pt, i) => {
      const within = pt[0] >= dmin && pt[0] <= dmax;
      if (within) return true;

      const prevLessThanMax = (i - 1 >= 0 && datapoints[i - 1][0] < dmax);
      const nextGreaterThanMin = (i + 1 < datapoints.length && datapoints[i + 1][0] > dmin);
      return (prevLessThanMax && nextGreaterThanMin);
    });
  }

  /**
   * Find the first index that has a finite numeric value
   * @param data data to search
   * @param start start index to search from
   */
  static findNextDefined(data: PlotData, start: number = 0) : number {
    for (let i = start; i < data.length; i++) {
      if (Number.isFinite(data[i][1])) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find the first index that has NOT a finite numeric value
   * @param data data to search
   * @param start start index to search from
   */
  static findNextUndefined(data: PlotData, start: number = 0) : number {
    for (let i = start; i < data.length; i++) {
      if (!Number.isFinite(data[i][1])) {
        return i;
      }
    }
    return -1;
  }

  /**
  * Resample large data series to reduce detail when number of points are
  * greater than the number of pixels to render it to. NOTE: you should pass the data through
  * the DataHelper.trimUndefinedValues before passing it to this function. Also, this function
  * assumes the datapoints are more or less uniformly spaced. The DataHelper.downsample is
  * probably safer and yields better results.
  * @param datapoints data to resample
  * @param ratio resample ratio
  * @param reducer function to reduce segments
  */
  static resample(datapoints: PlotData, ratio: number, reducer: ReducerFunction = DataHelper.mean) : PlotData {
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
      const undefinedIdx = DataHelper.findNextUndefined(segment);

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

  /**
   * Downsamples data by reducing segments that scales to the same approximate range
   * @param datapoints data to downsample
   * @param scale scale to control downsampling
   * @param reducer function to reduce segments
   */
  static downsample(datapoints: PlotData, scale: Scale, reducer: ReducerFunction = DataHelper.minmax) : PlotData {
    if (datapoints.length < 10) return datapoints;
    const ratio = ScaleHelper.getDomainRatio(scale);
    const lastIndex = datapoints.length - 1;
    const firstIndex = DataHelper.findNextDefined(datapoints);
    const first = datapoints[firstIndex];
    const last = datapoints[lastIndex];
    const reduced = [];
    let l = firstIndex + 1;
    let r = l + 1;
    while (r <= lastIndex) {
      const rp = datapoints[r];
      const isdef = Number.isFinite(rp[1]);
      if (!isdef || rp[0] - datapoints[l][0] > ratio || r === lastIndex) {
        const segment = r - l > 0 ? datapoints.slice(l, r) : [];
        if (segment.length === 1) {
          reduced.push(segment[0]);
        } else if (segment.length !== 0) {
          reduced.push(...reducer(segment));
        }
        if (!isdef) {
          reduced.push(rp);
          l = DataHelper.findNextDefined(datapoints, r + 1);
        } else {
          l = r;
        }
        if (l === -1) {
          break;
        }
        r = l + 1;
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
      while (md > arr1[0][0] && j < arr2.length) {
        md = arr2[j][0];
        res[n++] = [md, null, arr2[j][1]];
        j++;
      }
      while (md > arr2[0][0] && i < arr1.length) {
        md = arr1[i][0];
        res[n++] = [md, arr1[i][1], null];
        i++;
      }

      // correlate values using arr1 as master, averaging arr2
      while (i < arr1.length && j < arr2.length) {
        md = arr1[i][0];
        let rv = 0;
        let rn = 0;
        while (arr2[j][0] > md && i < arr1.length) {
          if (j > 0) {
            j--;
          } else {
            res[n++] = [md, arr1[i][1], null];
            md = arr1[++i][0];
          }
        }
        while (j < arr2.length && arr2[j][0] <= md) {
          if (arr2[j][1] === null) {
            res[n++] = [arr2[j][0], arr1[i][1], arr2[j][1]];
            j++;
            break;
          }
          rv += arr2[j][1];
          rn++;
          j++;
        }
        if (rn > 0) {
          res[n++] = [md, arr1[i][1], rv / rn];
        }
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
    try {
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
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
    return null;
  }

  /**
   * In a data set of two values, return the second element
   * of the item where the first item is closest to the query
   * value. The data set is considered to be discrete.
   */
  static queryPointData(queryVal: number, data: PlotData, threshold: number = 0) : number | null {
    try {
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
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
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
    try {
      const index = data.findIndex((d, i, arr) => (
        i < arr.length - 1 && d[1] !== null && d[0] <= queryVal && arr[i + 1][0] > queryVal
      ));

      return index > -1 ? data[index][1] : null;
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
    return null;
  }
}
