/**
 * Helper for rendering grid to canvas, used by GraphTrack
 */

/** major ticks color */
const colorMajor = '#ccc';
/** minor ticks color */
const colorMinor = '#ddd';
/** major stroke width */
const strokeMajor = 2;
/** minor stroke width */
const strokeMinor = 1;

/**
 * Draws grid to canvas according to input scales and ticks dictionaries.
 * Ticks are dictionaries of major and minor number arrays
 * @param {Canvas.context2d} ctx target canvas 2d context
 * @param {d3.scale} xscale x-scale
 * @param {object} xticks dictionary of major and minor arrays of ticks along x-axis
 * @param {d3.scale} yscale y-scale
 * @param {object} yticks dictionary of major and minor arrays of ticks along y-axis
 */
function drawGrid(ctx, xscale, xticks, yscale, yticks) {
  const [x0, x1] = xscale.range();
  const [y0, y1] = yscale.range();

  // vertical gridlines: MUST check if scale is linear/log
  ctx.strokeStyle = colorMinor;
  ctx.lineWidth = strokeMinor * 0.5;

  xticks.minor.forEach(tick => {
    const x = tick;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
  });
  ctx.strokeStyle = colorMajor;
  ctx.lineWidth = strokeMajor * 0.5;
  xticks.major.forEach(tick => {
    const x = tick;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
  });

  // horizontal
  ctx.strokeStyle = colorMinor;
  ctx.lineWidth = strokeMinor;
  yticks.minor.forEach(tick => {
    const y = yscale(tick);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
  });
  ctx.strokeStyle = colorMajor;
  ctx.lineWidth = strokeMajor;
  yticks.major.forEach(tick => {
    const y = yscale(tick);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
  });
}

export default {
  drawGrid,
};
