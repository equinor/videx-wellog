/* eslint-disable no-console */
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

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
      },
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
    ],
    plugins: [
      typescript({
        // eslint-disable-next-line global-require
        typescript: require('typescript'),
      }),
      terser({
        mangle: false,
      }),
    ],
    onwarn,
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'videx-wellog',
      file: pkg.browser,
      format: 'umd',
      globals: {
        d3: 'd3',
        'resize-observer-polyfill': 'ResizeObserver',
      },
    },
    plugins: [
      resolve(),
      typescript({
        // eslint-disable-next-line global-require
        typescript: require('typescript'),
      }),
      terser({
        mangle: false,
      }),
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
    ],
    onwarn,
  },
  {
    input: 'src/styles.scss',
    output: {
      file: 'dist/styles/styles.css',
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
