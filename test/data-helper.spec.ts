import { expect } from 'chai';
import { scaleLinear, range } from 'd3';
import DataHelper from '../src/utils/data-helper';
import { PlotData } from '../src/plots/interfaces';


describe('DataHelper', () => {
  // eslint-disable-next-line max-len
  const datapoints : PlotData = [[0, null], [1, null], [2, 10], [3, 20], [4, 10], [5, null], [6, null], [7, 30], [8, 32], [9, 60], [10, 43], [11, 50], [12, 2], [13, 51]];

  it('should reduce a segment of data points to its average', () => {
    const segment = datapoints.slice(2, 5);
    expect(DataHelper.avg(segment)).to.eql([[3, 40 / 3]]);
    expect(DataHelper.minmax(segment)).to.eql([[2, 10], [4, 20]]);
  });

  it('should be able to check if a set of points are within a scale domain', () => {
    const scale = scaleLinear().domain([2, 10]);
    expect(DataHelper.isWithinBounds(scale, datapoints)).to.be.true;
    scale.domain([14, 20]);
    expect(DataHelper.isWithinBounds(scale, datapoints)).to.be.false;
  });

  it('should filter data points based on provided domain and an excess factor', () => {
    expect(DataHelper.filterData(datapoints, [3, 5], 0)).to.eql([
      [3, 20], [4, 10], [5, null],
    ]);

    expect(DataHelper.filterData(datapoints, [3, 5], 0.5)).to.eql([
      [2, 10], [3, 20], [4, 10], [5, null], [6, null],
    ]);

    expect(DataHelper.filterData(datapoints, [4, 5], 1)).to.eql([
      [3, 20], [4, 10], [5, null], [6, null],
    ]);

    // should not filter points required to draw the first and last point
    // that are within the domain
    expect(DataHelper.filterData(datapoints, [4.1, 4.9], 0)).to.eql([
      [4, 10], [5, null],
    ]);
  });

  it('should be able to resample data points to a given ratio', () => {
    const data : PlotData = range(0, 10000, 1).map(d => [d, d]);
    expect(DataHelper.resample(data, 1)).to.eql(data);
    expect(DataHelper.resample(data, 1000)).to.eql([
      [0, 0],
      [500.5, 500.5],
      [1500.5, 1500.5],
      [2500.5, 2500.5],
      [3500.5, 3500.5],
      [4500.5, 4500.5],
      [5500.5, 5500.5],
      [6500.5, 6500.5],
      [7500.5, 7500.5],
      [8500.5, 8500.5],
      [9499.5, 9499.5],
      [9999, 9999],
     ]);
    expect(DataHelper.resample(data, 200)).to.eql([
      [0, 0],
      [100.5, 100.5],
      [300.5, 300.5],
      [500.5, 500.5],
      [700.5, 700.5],
      [900.5, 900.5],
      [1100.5, 1100.5],
      [1300.5, 1300.5],
      [1500.5, 1500.5],
      [1700.5, 1700.5],
      [1900.5, 1900.5],
      [2100.5, 2100.5],
      [2300.5, 2300.5],
      [2500.5, 2500.5],
      [2700.5, 2700.5],
      [2900.5, 2900.5],
      [3100.5, 3100.5],
      [3300.5, 3300.5],
      [3500.5, 3500.5],
      [3700.5, 3700.5],
      [3900.5, 3900.5],
      [4100.5, 4100.5],
      [4300.5, 4300.5],
      [4500.5, 4500.5],
      [4700.5, 4700.5],
      [4900.5, 4900.5],
      [5100.5, 5100.5],
      [5300.5, 5300.5],
      [5500.5, 5500.5],
      [5700.5, 5700.5],
      [5900.5, 5900.5],
      [6100.5, 6100.5],
      [6300.5, 6300.5],
      [6500.5, 6500.5],
      [6700.5, 6700.5],
      [6900.5, 6900.5],
      [7100.5, 7100.5],
      [7300.5, 7300.5],
      [7500.5, 7500.5],
      [7700.5, 7700.5],
      [7900.5, 7900.5],
      [8100.5, 8100.5],
      [8300.5, 8300.5],
      [8500.5, 8500.5],
      [8700.5, 8700.5],
      [8900.5, 8900.5],
      [9100.5, 9100.5],
      [9300.5, 9300.5],
      [9500.5, 9500.5],
      [9700.5, 9700.5],
      [9899.5, 9899.5],
      [9999, 9999],
    ]);
  });

  it('should be able to trim undefined data (no more than one neighbouring null value)', () => {
    expect(DataHelper.trimUndefinedValues(datapoints)).to.eql([
      [0, null],
      [2, 10],
      [3, 20],
      [4, 10],
      [5, null],
      [7, 30],
      [8, 32],
      [9, 60],
      [10, 43],
      [11, 50],
      [12, 2],
      [13, 51],
    ]);

    expect(DataHelper.trimUndefinedValues([
      [0, 0],
      [1, null],
      [2, null],
      [3, 0],
      [4, null],
      [5, 0],
      [6, null],
      [7, 0],
      [8, null],
      [9, null],
    ])).to.eql([
      [0, 0],
      [1, null],
      [3, 0],
      [4, null],
      [5, 0],
      [6, null],
      [7, 0],
      [8, null],
    ]);
  });

  it('should be able to merge two dataseries into one correlated serie', () => {
    const serie1 = DataHelper.trimUndefinedValues(datapoints);
    const serie2 : PlotData = serie1.slice(3, 10).map(d => [d[0], -d[1]]);

    let actual = DataHelper.mergeDataSeries(
      serie1,
      serie2,
    );

    let expected = [
      [0, null, null],
      [2, 10, null],
      [3, 20, null],
      [4, 10, -10],
      [5, null, 0],
      [7, 30, -30],
      [8, 32, -32],
      [9, 60, -60],
      [10, 43, -43],
      [11, 50, -50],
      [12, 2, null],
      [13, 51, null],
    ];
    expect(actual).to.eql(expected);

    // shift serie2
    actual = DataHelper.mergeDataSeries(
      serie1,
      serie2.map(d => [d[0] + 0.5, d[1]]),
    );

    expected = [
      [0, null, null],
      [2, 10, null],
      [3, 20, null],
      [4, 10, null],
      [5, null, -10],
      [7, 30, 0],
      [8, 32, -30],
      [9, 60, -32],
      [10, 43, -60],
      [11, 50, -43],
      [12, 2, -50],
      [13, 51, null],
    ];

    expect(actual).to.eql(expected);
  });
});
