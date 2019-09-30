import expect from 'expect';
import { scaleLinear } from 'd3';
import DataHelper from '../src/utils/data-helper';


describe('DataHelper', () => {
  // eslint-disable-next-line max-len
  const datapoints = [[0, null], [1, null], [2, 10], [3, 20], [4, 10], [5, null], [6, null], [7, 30], [8, 32], [9, 60], [10, 43], [11, 50], [12, 2], [13, 51]];

  it('should reduce a segment of data points to its average', () => {
    const segment = datapoints.slice(2, 5);
    expect(DataHelper.reduceSegment(segment)).toEqual([3, 40 / 3]);
  });

  it('should be able to check if a set of points are within a scale domain', () => {
    const scale = scaleLinear().domain([2, 10]);
    expect(DataHelper.isWithinBounds(scale, datapoints)).toBeTruthy();
    scale.domain([14, 20]);
    expect(DataHelper.isWithinBounds(scale, datapoints)).toBeFalsy();
  });
});
