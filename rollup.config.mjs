/* eslint-disable no-console */
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

import pkg from './package.json' assert { type: "json" };

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return;
  }
  warn(warning);
};

const exportedStyles = {
  'scale-styles': 'src/tracks/scale/styles.scss',
  'log-styles': 'src/ui/log-styles.scss',
  'loader-styles': 'src/ui/loader-styles.scss',
};

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        globals: {
          'd3-zoom': 'd3Zoom'
        }
      },
      {
        file: pkg.module,
        format: 'esm',
        globals: {
          'd3-zoom': 'd3Zoom'
        }
      },
    ],
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
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
        plugins: [
          autoprefixer,
        ],
        extract: true,
        extensions: ['.scss', '.css'],
      }),
      copy({
        targets: Object.entries(exportedStyles).map(d => ({
          src: d[1],
          dest: 'dist/styles',
          rename: `${d[0]}.scss`,
        })),
      }),
    ],
  },
];
