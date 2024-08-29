![](https://github.com/equinor/videx-wellog/workflows/Node%20CI/badge.svg)
![](https://img.shields.io/npm/v/@equinor/videx-wellog)

# Videx well log
Well log powered by the ViDEx well log components and [Volve open data sets](https://data.equinor.com/) provided by Equinor.

![volve-well-log](./resources/volve.png)

## Installation
```
npm install @equinor/videx-wellog
```

## Docs
Generate type-doc to `./docs`
```
npm run docs 
```

## Storybook

```
# from root:
npm run storybook:install
npm run storybook
```

# Tracks

Tracks are containers that can be added to a wellog component. A Track is resposible to react to lifecycle events provided by its container.

## Distribution Track

The Distribution Track visualizes the distribution of categories along a depth axis, showing how different components vary continuously or discretely with depth. 

### Config
Provided is a sample configuration object for setting up a Distribution Track.

```js
{
  label: 'Distribution',
  abbr: 'Dst',
  data: [
    {
        "depth": 1,
        "composition": [
            { "key": "Red Stone", "value": 80.00 },
            { "key": "Grey Stone", "value": 20.00 }
        ]
    },
    {
        "depth": 2,
        "composition": [
            { "key": "Red Stone", "value": 40.00 },
            { "key": "Grey Stone", "value": 60.00 }
        ]
    }
  ],
  legendConfig: distributionLegendConfig,
  components: {
    'Red Stone': {
      color: 'FireBrick',
      textColor: '#8E1B1B', // Optional, will use color by default
    },
    'Grey Stone': {
      color: 'SlateGrey',
    },
},
  interpolate: true,
}
```

**Note:** _distributionLegendConfig_ will use color given in _components_.

### Assumptions
- Depth is sorted in ascending order.
- Composition totals 100.

## Contribution
We greatly appreciate contributions to this repository, see our [contribution page](./contributing.md) on how to get started.
