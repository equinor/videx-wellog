module.exports = async ({ config }) => {
  config.module.rules.push(
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
    },
    { test: /\.glsl$/, use: ['shader-loader'] },
  );
  return config;
};
