# Tracks
Tracks are containers that can be added to a wellog component. A Track is resposible to react to lifecycle events provided by its container.

In the context of the wellog component, it is expected that all tracks visualise some data that can be mapped to a common domain scale. The container owning the track instances will handle any zoom/pan events and notify the tracks through its defined lifecycle events, which are:

* onMount - when the track's DOM element are added to the document
* onUnmount - when the track's DOM element are removed from the document
* onUpdate - when the track's DOM element are resized
* onRescale - when the y-scale's domain or transform is changed

In addition to the base Track class, there are other available implementations that you'd more likely extend custom tracks from. These are:

* SvgTrack - for tracks that renders svg elements
* CanvasTrack - for tracks that needs to render to a canvas 2d context
* HtmlTrack - for tracks that works with regular HTML DOM elements
