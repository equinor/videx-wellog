import { range } from 'd3';

export const ex1 = range(0, 2000, 10).map(d => [d, Math.random()]);

export const ex2 = {
  noise: range(0, 2000).map(d => [d, Math.random() * 90]),
  noise2: range(0, 2000).map(d => [d, Math.random() * 20])
};

const sin = range(0, 2000).map(d => [d, Math.sin((d / 2000) * Math.PI * 2 * 20) * 25 + 50]);
export const ex3 = {
  sin,
  noise: sin.map(v => [v[0], v[1] * Math.random() + 35]),
};
