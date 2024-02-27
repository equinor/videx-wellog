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

// Random Formation track (position, color and formation id.)
export const ex4 = async (formationLength=10) => {
  const names = ['Utsira Fm.', 'Frigg Fm.', 'Skade Fm.', 'Tor Fm.', 'Draupne Fm.', 'Hod Fm.'];

  const arr = [];
  let currentFrom = Math.random() * 1000 / formationLength;
  for (let index = 1; index <= formationLength; index++) {
    const newTo = currentFrom + Math.random() * 1500 / formationLength;

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

export const ex4_large = async () => {
  return ex4(3000);
};

export const ex4_xlarge = async () => {
  return ex4(30000);
};

// Formation track like in ex4 but with fixed position and color.
export const ex4_fix = async () => {
  const names = ['Utsira Fm.', 'Frigg Fm.', 'Skade Fm.', 'Tor Fm.', 'Draupne Fm.', 'Hod Fm.'];
  const colors = [
    {r:0,g:200,b:200}, 
    {r:2,g:200,b:2}, 
    {r:53,g:53,b:240}, 
    {r:224,g:254,b:84}, 
    {r:175,g:15,b:115}, 
    {r:116,g:116,b:116}
  ];
  const facies = [
    {id:1,from:10,to:40}, 
    {id:2,from:40,to:90}, 
    {id:3,from:90,to:240}, 
    {id:4,from:240,to:340},
    {id:5,from:340,to:600}, 
    {id:0,from:600,to:670}, 
    {id:2,from:670,to:720}, 
    {id:5,from:720,to:930}
  ];
  const arr = [];
  for (let index = 0; index < 8; index++) {
    const f = facies[index];

    const name = names[f.id];
    const area = {
      name: names[f.id],
      to: f.to,
      from: f.from,
      color: colors[f.id]
    };
    arr.push(area);
  }
  return arr;
}

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

// Facies Track using standard Name
export const ex7 = async (useShortName=false) => {
  const faciesTable = [
    { standardName: "Sandstone", shortName: "SS", color: [240, 230, 140] },
    { standardName: "Shale", shortName: "SH", color: [128, 128, 128] },
    { standardName: "Limestone", shortName: "LS", color: [255, 248, 220] },
    { standardName: "Conglomerate", shortName: "CG", color: [210, 105, 30] },
    { standardName: "Mudstone", shortName: "MS", color: [46, 139, 87] },
    { standardName: "Siltstone", shortName: "ST", color: [192, 192, 192] },
    { standardName: "Marl", shortName: "MR", color: [173, 216, 230] },
    { standardName: "Dolomite", shortName: "DO", color: [255, 255, 224] },
    { standardName: "Evaporite", shortName: "EV", color: [255, 255, 255] },
    { standardName: "Chert", shortName: "CH", color: [105, 105, 105] },
    { standardName: "Gypsum", shortName: "GP", color: [255, 192, 203] },
    { standardName: "Granite", shortName: "GN", color: [175, 175, 175] },
    { standardName: "Basalt", shortName: "BA", color: [50, 50, 50] },
    { standardName: "Schist", shortName: "SC", color: [100, 100, 100] },
    { standardName: "Quartzite", shortName: "QT", color: [230, 230, 230] },
    { standardName: "Phyllite", shortName: "PH", color: [120, 120, 120] },
    { standardName: "Gneiss", shortName: "GN", color: [200, 200, 200] },
    { standardName: "Marble", shortName: "MB", color: [255, 228, 196] },
    { standardName: "Serpentine", shortName: "SP", color: [154, 205, 50] },
    { standardName: "Anhydrite", shortName: "AH", color: [220, 220, 220] },
    { standardName: "Breccia", shortName: "BC", color: [160, 82, 45] }
  ];
  const depthSequence = [
    { id: 5, from: 0, to: 25 },
    { id: 0, from: 25, to: 55 },
    { id: 6, from: 55, to: 100 },
    { id: 5, from: 100, to: 140 },
    { id: 1, from: 140, to: 180 },
    { id: 8, from: 180, to: 220 },
    { id: 10, from: 220, to: 270 },
    { id: 3, from: 270, to: 330 },
    { id: 2, from: 330, to: 380 },
    { id: 7, from: 380, to: 440 },
    { id: 4, from: 440, to: 480 },
    { id: 12, from: 480, to: 530 },
    { id: 5, from: 530, to: 570 },
    { id: 5, from: 570, to: 600 },
    { id: 15, from: 600, to: 640 },
    { id: 18, from: 640, to: 675 },
    { id: 19, from: 675, to: 710 },
    { id: 16, from: 710, to: 745 },
    { id: 17, from: 745, to: 780 },
    { id: 20, from: 780, to: 815 },
    { id: 14, from: 815, to: 855 },
    { id: 13, from: 855, to: 895 },
    { id: 11, from: 895, to: 930 },
    { id: 9, from: 930, to: 960 },
    { id: 5, from: 960, to: 990 },
    { id: 0, from: 990, to: 1000 }
  ];
  const arr = [];
  for (let index = 0; index < depthSequence.length; index++) {
    const f = depthSequence[index];

    const name = useShortName ?
      faciesTable[f.id].shortName:
      faciesTable[f.id].standardName;
    const color = {
      r: faciesTable[f.id].color[0],
      g: faciesTable[f.id].color[1],
      b: faciesTable[f.id].color[2]
    };
    const area = {
      name: name,
      to: f.to,
      from: f.from,
      color: color
    };
    arr.push(area);
  }
  return arr;
}

// Facies Track using short Name
export const ex7_shortName = async() => {
  return ex7(true);
};