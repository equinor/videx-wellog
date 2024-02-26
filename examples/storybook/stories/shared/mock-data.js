import { range } from 'd3-array';

const domain = [0, 1500];
export const ex1 = range(domain[0], domain[1], 10).map(d => [d, Math.random()]);

export const ex2 = {
  noise: range(domain[0], domain[1]).map(d => [d, Math.random() * 90]),
  noise2: range(domain[0], domain[1]).map(d => [d, Math.random() * 20])
};

const sin = range(domain[0], domain[1]).map(d => [d, Math.sin((d / 2000) * Math.PI * 2 * 20) * 25 + 50]);
export const ex3 = {
  sin,
  noise: sin.map(v => [v[0], v[1] * Math.random() + 35]),
};

export const ex4 = async () => {
  const names = ['Utsira Fm.', 'Frigg Fm.', 'Skade Fm.', 'Tor Fm.', 'Draupne Fm.', 'Hod Fm.'];
  const formationLength = 10;

  const arr = [];
  let currentFrom = Math.random() * 100;
  for (let index = 1; index <= formationLength; index++) {
    const newTo = currentFrom + Math.random() * 100;

    const name = `${names[Math.floor(Math.random() * names.length)]}`;
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;
    const area = {
      name,
      to: newTo,
      from: currentFrom,
      color: {
        r,
        g,
        b,
      }
    };
    arr.push(area);
    currentFrom = newTo;
  }
  return arr;
};

export const ex5 = async () => {
  const cementLength = 10;
  const names = ['CEM', 'FORM', 'Other'];
  const l = ['A', 'B', 'C', 'D'];

  const arr = [];
  let currentFrom = Math.random() * 100;
  for (let index = 1; index <= cementLength; index++) {
    const newTo = currentFrom + 100 + Math.random() * 100;

    const name = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 8)}${l[Math.floor(Math.random() * l.length)]}`;
    const r = Math.random() * 255;
    const g = Math.random() * 255;
    const b = Math.random() * 255;
    const area = {
      name,
      to: newTo,
      from: currentFrom,
      color: {
        r,
        g,
        b,
      }
    };
    arr.push(area);
    currentFrom = newTo;
  }
  return arr;
};

export const ex6 = async () => {
  const totalDepth = 2000;
  const steps = 100;

  const step = totalDepth / steps;
  const arr = [];
  for (let index = 0; index < steps; index++) {
    const value = Math.random() > 0.5;

    const name = `flag ${index}`;
    const area = {
      name,
      from: index * step,
      to: (index + 1) * step,
      value,
      color: value ? { r: 255, g: 10, b: 219, a: 1 } : { r: 0, g: 0, b: 0, a: 0 },
    };
    arr.push(area);
  }
  return arr;
};
