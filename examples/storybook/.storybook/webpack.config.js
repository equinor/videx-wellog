

module.exports = async ({ config }) => {
  config.module.rules.push(
    { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader',  'postcss-loader'] },
  );
  return config;
};
