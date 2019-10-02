
const path = require("path");

module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /(\.css|\.scss|\.sass)$/,
    loaders: ["style-loader", "css-loader", "sass-loader"],
    include: path.resolve(__dirname, "../../../src")
  });
  return config;
};
