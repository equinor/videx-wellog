/** @type { import('@storybook/html-webpack5').StorybookConfig } */
const config = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-webpack5-compiler-swc',
  ],
  framework: {
    name: '@storybook/html-webpack5',
    options: {
      builder: {},
    },
  },
  docs: {},
};
export default config;
