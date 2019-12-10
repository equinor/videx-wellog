
const path = require("path");

module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /(\.css|\.scss|\.sass)$/,
    loaders: ["style-loader", "css-loader", "sass-loader"],
  });
  config.module.rules.push({
    test: /\.story\.js?$/,
    loaders: [require.resolve('@storybook/source-loader')],
    enforce: 'pre',
  });
  return config;
};
