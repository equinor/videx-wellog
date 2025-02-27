import { DipPlotCategory } from './interfaces';

enum DipPlotShape {
  BALL = 'ball',
  BREAKOUT = 'breakout',
  CIRCLE = 'circle',
  SQUARE = 'square',
  TEE = 'tee',
  TENSILE = 'tensile',
  TRIANGLE = 'triangle',
}

/**
 * DipShape
 */
export default class DipShape {
  public ctx: CanvasRenderingContext2D;
  public category: DipPlotCategory;
  public azimuth: number;
  public x1: number;
  public y1: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    category: DipPlotCategory,
    azimuth: number,
    x1: number,
    y1: number,
  ) {
    this.ctx = ctx;
    this.category = category;
    this.azimuth = azimuth;
    this.x1 = x1;
    this.y1 = y1;
  }

  draw() : void {
    this.drawTail();
    switch (this.category.shape) {
      case DipPlotShape.TRIANGLE:
        this.drawPolygon(10, 3);
        break;
      case DipPlotShape.SQUARE:
        this.drawPolygon(10, 4);
        break;
      case DipPlotShape.CIRCLE:
        this.drawCircle();
        break;
      case DipPlotShape.BALL:
        this.drawSphere();
        break;
      case DipPlotShape.TENSILE:
        this.drawArc();
        this.addStroke();
        break;
      case DipPlotShape.BREAKOUT:
        this.drawBreakout();
        break;
      case DipPlotShape.TEE:
        this.drawTee();
        break;
      default:
        this.drawCircle();
    }
  }

  drawArc() : void {
    const arcL = Math.PI * 2;
    this.ctx.beginPath();
    this.ctx.arc(this.x1, this.y1, 7.5, 0, arcL);
  }

  addFill(color: string = this.category.color) : void {
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  addStroke(color: string = this.category.color) : void {
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  drawTail() : void {
    const {
      azimuth,
      ctx,
      x1,
      y1,
    } = this;

    ctx.beginPath();
    ctx.lineWidth = 2;
    if ([DipPlotShape.BREAKOUT, DipPlotShape.TENSILE].includes(this.category.shape as DipPlotShape)) {
      const tailLength = 12.5;
      const x2 = x1 + Math.cos(azimuth) * tailLength;
      const y2 = y1 + Math.sin(azimuth) * tailLength;
      ctx.moveTo(x2, y2);
      const x3 = x1 - Math.cos(azimuth) * tailLength;
      const y3 = y1 - Math.sin(azimuth) * tailLength;
      ctx.lineTo(x3, y3);
    } else {
      const tailLength = this.category.shape === DipPlotShape.TEE ? 12.5 : 25;
      ctx.moveTo(x1, y1);
      const x2 = x1 + Math.cos(azimuth) * tailLength;
      const y2 = y1 + Math.sin(azimuth) * tailLength;
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    this.addStroke();
  }

  drawPolygon(
    radius: number,
    sides: number,
    x1: number = this.x1,
    y1: number = this.y1,
    azimuth: number = this.azimuth,
  ) : void {
    const {
      ctx,
    } = this;

    ctx.beginPath();
    ctx.lineWidth = 2;

    // Angle between vertices of polygon
    const verticesAngle = ((Math.PI * 2) / sides);
    // Rotate squares 45 degrees
    const rotate = sides === 4 ? azimuth + 0.7854 : azimuth;

    for (let i = 0; i < sides; i++) {
      const rotPos = (verticesAngle * i) + rotate;
      ctx.lineTo(
        x1 + radius * Math.cos(rotPos),
        y1 + radius * Math.sin(rotPos),
      );
    }

    ctx.closePath();
    this.addFill();
  }

  drawCircle() : void {
    this.drawArc();
    this.addFill('#fff');
    this.addStroke();
  }

  drawSphere() : void {
    this.drawArc();
    this.addFill();
  }

  drawBreakout() : void {
    const {
      azimuth,
      x1,
      y1,
    } = this;

    this.drawArc();
    this.addStroke();
    const triBreakoutLength = 10;
    const triX1 = x1 + Math.cos(azimuth) * triBreakoutLength;
    const triY1 = y1 + Math.sin(azimuth) * triBreakoutLength;
    const triX2 = x1 - Math.cos(azimuth) * triBreakoutLength;
    const triY2 = y1 - Math.sin(azimuth) * triBreakoutLength;
    this.drawPolygon(4, 3, triX1, triY1);
    this.drawPolygon(4, 3, triX2, triY2, azimuth + 3.14159);
  }

  drawTee() : void {
    const {
      azimuth,
      ctx,
      x1,
      y1,
    } = this;

    ctx.beginPath();
    ctx.lineWidth = 3;
    const angleAdjust = 67.5;
    const teeLength = 18;
    const xLeft = x1 + Math.cos(azimuth - angleAdjust) * teeLength;
    const yLeft = y1 + Math.sin(azimuth - angleAdjust) * teeLength;
    ctx.moveTo(xLeft, yLeft);
    const xRight = x1 + Math.cos(azimuth + angleAdjust) * teeLength;
    const yRight = y1 + Math.sin(azimuth + angleAdjust) * teeLength;
    ctx.lineTo(xRight, yRight);
    this.addStroke();
  }
}
