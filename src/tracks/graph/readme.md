# Graph Track
This track allowes multiple instances of plots to be layered on top of each other.

## Config
Example of a graph track options-object, adding a simple line plot. Different plot types may have different config options.

```js
{
  scale: 'linear',                      // d3 scale type (linear/log)
  domain: [0, 360],                     // d3 scale domain
  data: async function getData(){...},  // function to be called for fetching track data
  plots:[                               // plots
    {
      id: 'HAZI',                       // plot id
      type: 'line',                     // type (line/area/dot/differential)
      options: {                        // plot options
        scale: 'linear',                // plot scale
        domain: [0, 360],               // plot domain
        color: 'blue',                  // color for line graph
        data: d => d.HAZI.dataPoints,   // accessor function to get data returned by track data function
      },
    },
    (...)
  ],
}
```
