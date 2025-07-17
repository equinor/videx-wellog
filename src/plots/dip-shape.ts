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
  private length: number;
  private radius: number;
  private barLength: number;
  private tailLength: number;
  private teeLength: number;

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
    this.length = 7.5;
    this.radius = this.length * 0.67;
    this.barLength = this.length * 1.25;
    this.teeLength = this.length * 1.8;
    this.tailLength = this.length * 2.5;
  }

  draw() : void {
    const {
      category,
      length,
    } = this;

    this.drawTail();
    switch (category.shape) {
      case DipPlotShape.TRIANGLE:
        this.drawPolygon(length, 3);
        break;
      case DipPlotShape.SQUARE:
        this.drawPolygon(length, 4);
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
    const {
      radius,
      x1,
      y1,
    } = this;

    const arcL = Math.PI * 2;

    this.ctx.beginPath();
    this.ctx.arc(x1, y1, radius, 0, arcL);
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
      barLength,
      category,
      ctx,
      tailLength,
      x1,
      y1,
    } = this;

    ctx.beginPath();
    ctx.lineWidth = 2;

    if ([DipPlotShape.BREAKOUT, DipPlotShape.TENSILE].includes(category.shape as DipPlotShape)) {
      const x2 = x1 + Math.cos(azimuth) * barLength;
      const y2 = y1 + Math.sin(azimuth) * barLength;
      ctx.moveTo(x2, y2);
      const x3 = x1 - Math.cos(azimuth) * barLength;
      const y3 = y1 - Math.sin(azimuth) * barLength;
      ctx.lineTo(x3, y3);
    } else if ([DipPlotShape.TEE].includes(category.shape as DipPlotShape)) {
      ctx.moveTo(x1, y1);
      const x2 = x1 + Math.cos(azimuth) * barLength;
      const y2 = y1 + Math.sin(azimuth) * barLength;
      ctx.lineTo(x2, y2);
    } else {
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
      length,
      x1,
      y1,
    } = this;

    this.drawArc();
    this.addStroke();
    const triX1 = x1 + Math.cos(azimuth) * length;
    const triY1 = y1 + Math.sin(azimuth) * length;
    const triX2 = x1 - Math.cos(azimuth) * length;
    const triY2 = y1 - Math.sin(azimuth) * length;
    this.drawPolygon(4, 3, triX1, triY1);
    this.drawPolygon(4, 3, triX2, triY2, azimuth + 3.14159);
  }

  drawTee() : void {
    const {
      azimuth,
      ctx,
      teeLength,
      x1,
      y1,
    } = this;

    ctx.beginPath();
    ctx.lineWidth = 3;
    const angleAdjust = 67.5;
    const xLeft = x1 + Math.cos(azimuth - angleAdjust) * teeLength;
    const yLeft = y1 + Math.sin(azimuth - angleAdjust) * teeLength;
    ctx.moveTo(xLeft, yLeft);
    const xRight = x1 + Math.cos(azimuth + angleAdjust) * teeLength;
    const yRight = y1 + Math.sin(azimuth + angleAdjust) * teeLength;
    ctx.lineTo(xRight, yRight);
    this.addStroke();
  }
}
