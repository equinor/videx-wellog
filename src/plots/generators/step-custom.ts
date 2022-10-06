/**
 * Custom stepladder curve generator for d3-line
 */
class StepCustom {
  _ctx: CanvasRenderingContext2D;
  _line: boolean;
  _x: number;
  _y: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    this._line = undefined;
    this._x = NaN;
    this._y = NaN;
  }

  areaStart() : void {
    this._line = true;
  }

  areaEnd() : void {
    this._line = false;
  }

  lineStart() : void {
    this._x = NaN;
    this._y = NaN;
  }

  lineEnd() : void {
    if (this._line) this._ctx.closePath();
  }

  point(x: number, y: number) : void {
    if (!(Number.isNaN(x) || Number.isNaN(y))) {
      if (Number.isNaN(this._y)) {
        this._ctx.moveTo(x, y);
      } else {
        if (y !== this._y) this._ctx.lineTo(x, this._y);
        this._ctx.lineTo(x, y);
      }
    } else if (!(Number.isNaN(x) || Number.isNaN(this._x) || Number.isNaN(this._y))) {
      this._ctx.lineTo(x, this._y);
    }
    this._x = x;
    this._y = y;
  }
}

export default function stepCustom(ctx) {
  return new StepCustom(ctx);
}
