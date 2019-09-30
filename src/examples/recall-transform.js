import { ScaleHelper, DataHelper } from '../utils';

/**
 * A Recall log data transformation implementation to downsample log data.
 * Data is a dictionary, where each key correspond to a dataset. Each dataset
 * is an object containing name, unit and dataPoints array.
 *
 * Ex:
 * {
 *    WOB: {
 *      name: 'WOB',
 *      unit: 'T',
 *      dataPoints: [[md, T] ...],
 *    },
 *    ...
 * }
 * @param {object} data dictionary object with data series
 * @param {d3.scale} scale input scale
 * @returns {Promise<object>} object of resampled datasets, according to data
 */
export default function recallTransform(data, scale) {
  const res = {};
  Object.keys(data).forEach(key => {
    res[key] = { ...data[key] };

    if (data[key].dataPoints) {
      const points = data[key].dataPoints;
      if (points && points.length > 0) {
        const height = ScaleHelper.getDomainSpan(
          scale,
          [points[0][0], points[points.length - 1][0]],
        );
        const transformed = DataHelper.resample(points, points.length / height);
        res[key].dataPoints = DataHelper.filterData(transformed, scale.domain());
      }
    }
  });
  return Promise.resolve(res);
}
