/* eslint-disable no-console */
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import { dependencies } from './package.json';

const input = {
  index: 'src/index.js',
};

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return;
  }
  warn(warning);
};

const external = Object.keys(dependencies);

const exportedStyles = {
  'scale-styles': 'src/tracks/scale/styles.scss',
  'wellog-styles': 'src/ui/wellog-styles.scss',
};

export default [
  // CommonJS
  {
    input,
    external,
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      esModule: false,
    },
    plugins: [
      babel({
        exclude: ['node_modules/**'],
      }),
      resolve(),
      commonjs(),
    ],
    onwarn,
  },
  // ES module
  {
    input,
    external,
    output: {
      dir: 'dist/esm',
      format: 'esm',
    },
    plugins: [
      resolve(),
    ],
    onwarn,
  },
  // styles
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
