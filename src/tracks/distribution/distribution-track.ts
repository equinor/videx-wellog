import { color } from 'd3-color';
import WebGL2Track from '../webgl2-track';
import { DistributionTrackOptions } from './interfaces';
import { OnMountEvent } from '../interfaces';

import vertexShaderSource from '../../common/simple-shader.vert.glsl';
import fragmentShaderSource from './distribution-shader.frag.glsl';

const defaultOptions: DistributionTrackOptions = {
  interpolationType: 0,
  discreteHeight: 0.01,
};

// Defined to avoid creating new arrays when clearing
const ComponentColorsClear = new Float32Array([]);
const InterpolationConfigClear = new Float32Array([0, 0]);

/** Track for visualising distribution of data. */
export class DistributionTrack extends WebGL2Track<DistributionTrackOptions> {
  interpolationConfigArray: Float32Array;

  constructor(id: string | number, options: DistributionTrackOptions = {}) {
    super(id, {
      ...defaultOptions,
      ...options,
    });
  }

  // Reference shaders code
  protected vertexShaderSource = vertexShaderSource;
  protected fragmentShaderSource = fragmentShaderSource;

  /** Override of onMount from base class. */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const { options, loader } = this;

    // Setup interpolation config array based on interpolation settings
    this.interpolationConfigArray = new Float32Array([options.interpolationType, options.discreteHeight]);

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
    const { options, gl, program } = this;

    // Get uniform locations
    const componentCountLocation = gl.getUniformLocation(program, 'u_componentCount');
    const componentColorsLocation = gl.getUniformLocation(program, 'u_componentColors');
    const entryCountLocation = gl.getUniformLocation(program, 'u_entryCount');
    const interpolationConfigLocation = gl.getUniformLocation(program, 'u_interpolationConfig');

    if (!data) {
      // Clear uniforms
      gl.uniform1i(componentCountLocation, 0);
      gl.uniform3fv(componentColorsLocation, ComponentColorsClear);
      gl.uniform1i(entryCountLocation, 0);
      gl.uniform2fv(interpolationConfigLocation, InterpolationConfigClear);

      // Unbind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, null);

      return;
    }

    // Extract and normalize RGB arrays from components
    const rgbArray = Object.values(options.components).map(component => {
      const { r, g, b } = color(component.color).rgb();
      return [r / 255, g / 255, b / 255];
    });

    // Flatten the data into a normalized 1D array
    const flatData = data.flatMap((d: any) => {
      let cumulative = 0;
      const composition = d.composition.map((p: any) => {
        cumulative += p.value / 100;
        return cumulative;
      });
      return [d.depth, ...composition];
    });

    // Pass uniforms
    gl.uniform1i(componentCountLocation, rgbArray.length);
    gl.uniform3fv(componentColorsLocation, rgbArray.flat());
    gl.uniform1i(entryCountLocation, data.length);
    gl.uniform2fv(interpolationConfigLocation, this.interpolationConfigArray);

    // Calculate texture dimensions
    const width = rgbArray.length + 1;
    const height = flatData.length / width;

    // Create and bind texture
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Create a red-channel only texture from data
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      width,
      height,
      0,
      gl.RED,
      gl.FLOAT,
      new Float32Array(flatData),
    );

    // Set Texture Parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Get Location of Texture in Shader
    const dataTextureLocation = gl.getUniformLocation(program, 'u_dataTexture');
    gl.uniform1i(dataTextureLocation, 0); // Texture unit 0
  }
}
