/* eslint-disable no-console */
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const input = {
  index: 'src/index.js',
};

const onwarn = (warning, warn) => {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return;
  }
  warn(warning);
};

const external = [
  'd3',
];

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
];
