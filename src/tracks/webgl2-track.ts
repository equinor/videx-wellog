import { select, Selection } from 'd3-selection';
import Track from './track';
import { setProps } from '../utils';
import {
  TrackOptions,
  OnMountEvent,
  OnUpdateEvent,
  OnRescaleEvent,
} from './interfaces';

/** Compile a shader from source */
function compileShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: number,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create shader');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Could not compile shader: ${info}`);
  }
  return shader;
}

/** Set up vertex buffer */
function setupBuffer(gl: WebGL2RenderingContext, program: WebGLProgram) {
  // Create buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // Create rect spanning full canvas
  const vertices = new Float32Array([
    -1.0,
    -1.0, // Bottom-left
    1.0,
    -1.0, // Bottom-right
    -1.0,
    1.0, // Top-left
    1.0,
    1.0, // Top-right
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Get attribute location and enable it
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

/** Base track for WebGL2 rendering. */
export default abstract class WebGL2Track<
  TOptions extends TrackOptions,
> extends Track<TOptions> {
  canvas: Selection<HTMLCanvasElement, unknown, null, undefined>;
  gl: WebGL2RenderingContext;

  program: WebGLProgram | null;
  domainLocation: WebGLUniformLocation | null;

  protected abstract vertexShaderSource: string;
  protected abstract fragmentShaderSource: string;

  /** Override to add canvas element for WebGL2 rendering. */
  onMount(trackEvent: OnMountEvent): void {
    super.onMount(trackEvent);

    this.canvas = select(trackEvent.elm)
      .append('canvas')
      .style('position', 'absolute');

    const gl = (this.gl = this.canvas.node().getContext('webgl2'));
    if (!gl) return;

    const vertexShader = compileShader(
      gl,
      this.vertexShaderSource,
      gl.VERTEX_SHADER,
    );
    const fragmentShader = compileShader(
      gl,
      this.fragmentShaderSource,
      gl.FRAGMENT_SHADER,
    );

    const program = (this.program = gl.createProgram());
    if (!program) return;

    // Attach shaders and link program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Return if linking failed
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    // Use the shader program
    gl.useProgram(program);

    // Get and store domain uniform location
    this.domainLocation = gl.getUniformLocation(program, 'u_domain');

    const horizontalLocation = gl.getUniformLocation(program, 'u_horizontal');
    if (horizontalLocation !== null) {
      gl.uniform1i(horizontalLocation, this.options?.horizontal ? 1 : 0);
    }

    // Ensure vertex buffer cover full track
    setupBuffer(gl, program);
  }

  /** Override to scale canvas element on resize. */
  onUpdate(trackEvent: OnUpdateEvent) {
    super.onUpdate(trackEvent);

    const { canvas, gl, elm } = this;
    const { width } = elm.getBoundingClientRect();

    if (gl) {
      const props = {
        styles: {
          width: `${width}px`,
          height: `${elm.clientHeight}px`,
        },
        attrs: {
          width,
          height: elm.clientHeight,
        },
      };
      setProps(canvas, props);

      // Set viewport to match canvas size
      gl.viewport(0, 0, width, elm.clientHeight);

      this.redrawContext();
    }
  }

  onRescale(trackEvent: OnRescaleEvent): void {
    super.onRescale(trackEvent);
    this.redrawContext();
  }

  /** Override of onDataLoaded from base class. */
  onDataLoaded(data?: any) {
    super.onDataLoaded(data);
    this.processData(data);
    this.redrawContext();
  }

  protected abstract processData(data?: any): void;

  private redrawContext() {
    const { gl, domainLocation } = this;
    if (!gl || !domainLocation) return;

    // Clear and redraw
    const [min, max] = this.scale.domain();
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(domainLocation, min, max);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
