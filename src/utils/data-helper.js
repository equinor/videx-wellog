/**
 * Various utility functions for transforming and processing
 * data sets.
 */
import { mean } from 'd3';

/**
 * Reduce multiple points to the its average values.
 * @param {number[][]} segment segment of data points array
 * @returns {number[]} averaged point
 */
function reduceSegment(segment) {
  const avgV = mean(segment, d => d[1]);
  const avgD = mean(segment, d => d[0]);

  return [avgD, avgV];
}

/**
* Test if the data is withing the scale's domain
* @param {d3.scale} scale scale to test against
* @param {number[][]} datapoints data points array
* @returns {boolean}
*/
function isWithinBounds(scale, datapoints) {
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
* @param {number[][]} datapoints data points array
* @returns {number[][]} filtered datapoints
*/
function trimUndefinedValues(datapoints) {
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
* @param {number[][]} datapoints data points array
* @param {number[]} domain domain
* @param {number} excessFactor excess factor to extend the input domain
* @returns {number[][]} filtered datapoints
*/
function filterData(datapoints, domain, excessFactor = 0.5) {
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
* @param {number[][]} datapoints data points array
* @param {number} ratio compression ratio
* @returns {number[][]} resampled datapoints
*/
function resample(datapoints, ratio) {
  if (ratio <= 2 || datapoints.length < 100) return datapoints;

  ratio = Math.floor(ratio);

  const lastIndex = datapoints.length - 1;
  const first = datapoints[0];
  const last = datapoints[lastIndex];
  let l = 1;
  const averaged = [];
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
        averaged.push(reduceSegment(segment));
        r += segment.length;
      }
      averaged.push(undefinedEntry);

      if (trailingEntry) {
        averaged.push(trailingEntry);
        r++;
      }
    } else if (segment.length > 0) {
      averaged.push(reduceSegment(segment));
    }
    l = r;

    // ael
    _safe++;
    if (_safe > 1000000) {
      throw Error('Infinite loop terminated!');
    }
  }
  return [first, ...averaged, last];
}

/**
* Trim two data series so that it can be correlated.
* Used in differential plot.
* @param {number[][]} arr1 data points array
* @param {number[][]} arr2 data points array
* @returns {number[][]} merged dataset
*/
function mergeDataSeries(arr1, arr2) {
  const res = [];
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
      res[n++] = [...arr1[i], null];
      i++;
    }

    while (j < arr2.length) {
      res[n++] = [arr2[j][0], null, arr2[j][1]];
      j++;
    }

    return res;
  }
  if (arr1.length > 0) {
    return arr1.map(d => [...d, null]);
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
 * @param {number} queryVal query value
 * @param {number[][]} data data points to query
 * @returns {number|null}
 */
function queryContinuousData(queryVal, data) {
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
 * @param {number} queryVal query value
 * @param {number[][]} data data points to query
 * @returns {number|null}
 */
function queryPointData(queryVal, data, threshold = 0) {
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
 * @param {number} queryVal query value
 * @param {number[][]} data data points to query
 * @returns {number|null}
 */
function queryZoneData(queryVal, data) {
  const index = data.findIndex((d, i, arr) =>
    (i < arr.length - 1 && d[1] !== null && d[0] <= queryVal && arr[i + 1][0] > queryVal));
  return index > -1 ? data[index][1] : null;
}

export default {
  reduceSegment,
  isWithinBounds,
  filterData,
  resample,
  trimUndefinedValues,
  mergeDataSeries,
  queryContinuousData,
  queryPointData,
  queryZoneData,
};
