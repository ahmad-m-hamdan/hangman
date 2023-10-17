module.exports = function override(config, env) {
  let loaders = config.resolve;
  loaders.fallback = {
    // existing configs...
    fs: false,
    crypto: false,
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    "crypto-browserify": require.resolve("crypto-browserify"),
  };

  return config;
};
