/* eslint-disable no-console */
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import glslify from 'rollup-plugin-glslify';

import pkg from './package.json' with { type: 'json' };

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return;
  }
  warn(warning);
};

const exportedStyles = [
  { src: 'src/tracks/scale/styles.scss', rename: 'scale-styles.scss' },
  { src: 'src/ui/log-styles.scss', rename: 'log-styles.scss' },
  { src: 'src/ui/loader-styles.scss', rename: 'loader-styles.scss' },
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      glslify(),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({ extensions: ['.mjs', '.js', '.json', '.node', '.ts'] }),
      terser({ mangle: false }),
    ],
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'videx-wellog',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      glslify(),
      typescript({ tsconfig: './tsconfig.json' }),
      nodeResolve({ extensions: ['.mjs', '.js', '.json', '.node', '.ts'] }),
      terser({ mangle: false }),
    ],
    onwarn,
  },
  {
    input: 'src/styles.scss',
    output: {
      file: 'dist/styles/styles.js',
      format: 'es',
    },
    plugins: [
      postcss({
        plugins: [autoprefixer],
        extract: true,
        extensions: ['.scss', '.css'],
      }),
      copy({
        targets: exportedStyles.map(({ src, rename }) => ({
          src,
          dest: 'dist/styles',
          rename,
        })),
      }),
    ],
  },
];
