# Videx Wellog Project

Videx Wellog is a set of components developed by the Videx team in Equinor for viewing subsurface wellbore logs.

The library are composed by multiple components that are designed to work together, as independant components and/or as extension points. All relevant classes are exported.

Full-featured components exists in the `./ui` folder, and are:
* `BasicTrackViewer` - minimalistic container for working with tracks.
* `WellogComponent` - full-featured container.

Track components are located in the `./tracks` folder:
* `Track` - base class (abstract)
* `CanvasTrack` - base class for tracks that renders to a 2d context (HTML5 canvas)
* `SvgTrack` - base class for tracks that work with SVG (vector graphics)
* `HtmlTrack` - base class for tracks that work with general HTML elements.
* `ScaleTrack` - basic track for displaying y-axis ticks
* `DualScaleTrack` - scale track supporting two seperate domains. For instance to show MD depth and TVD depth. Requires a `InterpolatedScaleHandler`.
* `GraphTrack` - supports rendering of multiple deta series. Different graph types are supported, with implementations of the `Plot` class:
  * `LinePlot` - linear line graph
  * `AreaPlot` - area graph
  * `DotPlot` - discrete points graph
  * `DifferentialPlot` - differential graph, for correlation of two data series.

