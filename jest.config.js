/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  testEnvironment: 'node',
  moduleDirectories: ["node_modules", 'src'],
  moduleNameMapper: {
    "^d3-drag": "<rootDir>/node_modules/d3-zoom/node_modules/d3-drag/dist/d3-drag.min.js",
    "^d3-transition": "<rootDir>/node_modules/d3-zoom/node_modules/d3-transition/dist/d3-transition.min.js",
    "d3-zoom": "<rootDir>/node_modules/d3-zoom/dist/d3-zoom.min.js",
  }
};
