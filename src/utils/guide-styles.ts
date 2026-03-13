/** Major guide line color */
const COLOR_MAJOR = '#ccc';

/** Minor guide line color */
const COLOR_MINOR = '#ddd';

/** Major stroke width */
const STROKE_MAJOR = 2;

/** Minor stroke width */
const STROKE_MINOR = 1;

export function applyMajor(
  ctx: CanvasRenderingContext2D,
  lineScale: number = 1.0,
) {
  ctx.strokeStyle = COLOR_MAJOR;
  ctx.lineWidth = STROKE_MAJOR * lineScale;
}

export function applyMinor(
  ctx: CanvasRenderingContext2D,
  lineScale: number = 1.0,
) {
  ctx.strokeStyle = COLOR_MINOR;
  ctx.lineWidth = STROKE_MINOR * lineScale;
}
