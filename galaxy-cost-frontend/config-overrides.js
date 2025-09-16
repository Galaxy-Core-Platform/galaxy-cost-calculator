const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallback for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer/")
  };
  
  // Add plugins to provide globals
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  );
  
  // Fix for fully specified imports
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  });
  
  return config;
};