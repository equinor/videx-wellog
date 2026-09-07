import { lerp } from '@equinor/videx-math';

const lithologyAtlas = {
  'CEMENTED SAND': {
    displayName: 'Cemented Sand',
    rgb: { r: 236, g: 232, b: 162 },
  },
  CLAYSTONE: {
    displayName: 'Claystone',
    rgb: { r: 101, g: 167, b: 64 },
  },
  COAL: {
    displayName: 'Coal',
    rgb: { r: 10, g: 10, b: 10 },
  },
  CONGLOMERATE: {
    displayName: 'Conglomerate',
    rgb: { r: 255, g: 193, b: 0 },
  },
  LIMESTONE: {
    displayName: 'Limestone',
    rgb: { r: 0, g: 165, b: 203 },
  },
  'SAND GRAINS': {
    displayName: 'Sand Grains',
    rgb: { r: 255, g: 247, b: 143 },
  },
  SHALE: {
    displayName: 'Shale',
    rgb: { r: 136, g: 112, b: 0 },
  },
  SILTSTONE: {
    displayName: 'Siltstone',
    rgb: { r: 179, g: 212, b: 84 },
  },
  'SILTY CLAYSTONE': {
    displayName: 'Silty Claystone',
    rgb: { r: 140, g: 189, b: 74 },
  },
};

const lithologyDistribution = [
  { lithologyName: 'CEMENTED SAND', shallowRate: 0.0056, deepRate: 0.0098 },
  { lithologyName: 'CLAYSTONE', shallowRate: 0.6882, deepRate: 0.4481 },
  { lithologyName: 'COAL', shallowRate: 0.0018, deepRate: 0.0106 },
  { lithologyName: 'CONGLOMERATE', shallowRate: 0.0028, deepRate: 0.0065 },
  { lithologyName: 'LIMESTONE', shallowRate: 0.0061, deepRate: 0.0062 },
  { lithologyName: 'SAND GRAINS', shallowRate: 0.0843, deepRate: 0.0516 },
  { lithologyName: 'SHALE', shallowRate: 0.1655, deepRate: 0.4157 },
  { lithologyName: 'SILTSTONE', shallowRate: 0.0031, deepRate: 0.0247 },
  { lithologyName: 'SILTY CLAYSTONE', shallowRate: 0.0437, deepRate: 0.0273 },
];

const depthIntervals = [
  { interval: 2, weight: 0.64 },
  { interval: 3, weight: 0.11 },
  { interval: 5, weight: 0.22 },
  { interval: 6, weight: 0.03 },
];

export const exampleMajorityPredictionData = () => {
  const data = [];
  let depth = 0;

  while (depth < 1000) {
    let r1 = Math.random();
    const interval = depthIntervals.find(p => {
      r1 -= p.weight;
      return r1 <= 0;
    }).interval;

    // Depth ratio
    const depthT = depth / 1000;

    let r2 = Math.random();
    const lithologyName = Object.values(lithologyDistribution).find(p => {
      const weight = lerp(p.shallowRate, p.deepRate, depthT);
      r2 -= weight;
      return r2 <= 0;
    }).lithologyName;

    // Get display name and color from atlas
    const { displayName, rgb } = lithologyAtlas[lithologyName];

    // Add data
    data.push({ depth, lithologyName, displayName, rgb });

    depth += interval;
  }

  return data;
};
