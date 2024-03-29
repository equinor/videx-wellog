/** @type { import('@storybook/html-webpack5').StorybookConfig } */
const config = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-styling-webpack",
    "@storybook/addon-webpack5-compiler-swc"
  ],
  framework: {
    name: "@storybook/html-webpack5",
    options: {
      builder: {},
    },
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
