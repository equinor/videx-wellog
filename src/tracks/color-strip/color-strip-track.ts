import WebGL2Track from '../webgl2-track';
import { ColorStripTrackOptions } from './interfaces';
import { OnMountEvent } from '../interfaces';

import vertexShaderSource from '../../common/simple-shader.vert.glsl';
import fragmentShaderSource from './color-strip-shader.frag.glsl';

export class ColorStripTrack extends WebGL2Track<ColorStripTrackOptions> {
  // Reference shaders
  protected vertexShaderSource = vertexShaderSource;
  protected fragmentShaderSource = fragmentShaderSource;

  /** Override of onMount from base class. */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const { options, loader } = this;

    // Load data
    if (options.data) {
      const showLoader = options.showLoader ?? Boolean(loader);

      if (showLoader && typeof (options.data) === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  protected processData(data?: any): void {
    const { gl, program } = this;

    const entryCountLocation = gl.getUniformLocation(program, 'u_entryCount');
    const dataTextureLocation = gl.getUniformLocation(program, 'u_dataTexture');

    if (!data) {
      // Clear uniforms
      gl.uniform1i(entryCountLocation, 0);

      // Unbind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return;
    }

    const flatData = data.flatMap((d: any) => [
      d.rgb.r / 255,
      d.rgb.g / 255,
      d.rgb.b / 255,
      d.depth,
    ]);

    const width = 1;
    const height = data.length;

    // Create and bind texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      new Float32Array(flatData),
    );

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Set uniforms
    gl.uniform1i(entryCountLocation, data.length);
    gl.uniform1i(dataTextureLocation, 0);
  }
}
